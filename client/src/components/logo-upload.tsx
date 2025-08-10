import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useSettings } from '@/hooks/useSettings';

export default function LogoUpload() {
  const { toast } = useToast();
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Get current user data to access logo
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (logoData: string) => {
      const response = await fetch('/api/user/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ logo: logoData }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: t('success'),
        description: settings?.language === 'en' ? 'Logo uploaded successfully' : 'Logo téléchargé avec succès',
      });
      setPreviewUrl(null);
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message || (settings?.language === 'en' ? 'Failed to upload logo' : 'Erreur lors du téléchargement du logo'),
        variant: 'destructive',
      });
    },
  });

  const removeLogoMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/user/logo', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Remove failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: t('success'),
        description: settings?.language === 'en' ? 'Logo removed successfully' : 'Logo supprimé avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message || (settings?.language === 'en' ? 'Failed to remove logo' : 'Erreur lors de la suppression du logo'),
        variant: 'destructive',
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('error'),
        description: settings?.language === 'en' ? 'Image too large (max 5MB)' : 'Image trop volumineuse (max 5MB)',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  }, [toast, t, settings?.language]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
  });

  const handleUpload = () => {
    if (previewUrl) {
      uploadLogoMutation.mutate(previewUrl);
    }
  };

  const handleRemove = () => {
    removeLogoMutation.mutate();
  };

  const currentLogo = (user as any)?.companyLogo;

  return (
    <div className="space-y-4">
      {/* Current Logo Display */}
      {currentLogo && (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center space-x-3">
            <img 
              src={currentLogo} 
              alt="Company Logo" 
              className="w-12 h-12 object-contain border rounded"
            />
            <div>
              <p className="font-medium text-sm">{t('logoPreview')}</p>
              <p className="text-xs text-gray-500">
                {settings?.language === 'en' ? 'Current company logo' : 'Logo actuel de l\'entreprise'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRemove}
            disabled={removeLogoMutation.isPending}
          >
            <X className="w-4 h-4 mr-1" />
            {t('removeLogo')}
          </Button>
        </div>
      )}

      {/* Upload Area */}
      {previewUrl ? (
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-4">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="mx-auto max-w-32 max-h-32 object-contain border rounded"
              />
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={handleUpload}
                  disabled={uploadLogoMutation.isPending}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadLogoMutation.isPending ? 
                    (settings?.language === 'en' ? 'Uploading...' : 'Téléchargement...') : 
                    t('uploadLogo')
                  }
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setPreviewUrl(null)}
                >
                  {t('cancel')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-primary">
                  {settings?.language === 'en' ? 'Drop the logo here...' : 'Déposez le logo ici...'}
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-600">
                    {settings?.language === 'en' 
                      ? 'Drag and drop your company logo here, or click to select'
                      : 'Glissez-déposez le logo de votre entreprise ici, ou cliquez pour sélectionner'
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {settings?.language === 'en' 
                      ? 'PNG, JPG, GIF up to 2MB'
                      : 'PNG, JPG, GIF jusqu\'à 2MB'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}