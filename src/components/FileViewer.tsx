
import React from 'react';
import { ExternalLink, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FileViewerProps {
  fileUrl: string | null;
  title?: string;
  className?: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileUrl, title = "Document", className = "" }) => {
  const navigate = useNavigate();

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
        <div className="text-center">
          <ExternalLink className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No file available</p>
        </div>
      </div>
    );
  }

  const getFileExtension = (url: string): string => {
    try {
      const urlObject = new URL(url);
      const pathname = urlObject.pathname;
      const extension = pathname.split('.').pop()?.toLowerCase() || '';
      return extension;
    } catch {
      return '';
    }
  };

  const getGoogleDriveFileId = (url: string): string | null => {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const getEmbedUrl = (url: string): string | null => {
    const extension = getFileExtension(url);
    
    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com')) {
      const fileId = getGoogleDriveFileId(url);
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    
    switch (extension) {
      case 'pdf':
        // For PDF files, we can embed directly
        return url;
      
      case 'ppt':
      case 'pptx':
        // For PowerPoint files, use Microsoft Office Online viewer
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
      
      case 'doc':
      case 'docx':
        // For Word documents, also use Microsoft Office Online viewer
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
      
      default:
        return null;
    }
  };

  const isSupported = (url: string): boolean => {
    const extension = getFileExtension(url);
    return ['pdf', 'ppt', 'pptx', 'doc', 'docx'].includes(extension) || url.includes('drive.google.com');
  };

  const handleFullscreenView = () => {
    if (fileUrl.includes('drive.google.com')) {
      const fileId = getGoogleDriveFileId(fileUrl);
      if (fileId) {
        navigate(`/drive-viewer/${fileId}?title=${encodeURIComponent(title)}&back=${encodeURIComponent(window.location.pathname)}`);
      }
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  const embedUrl = getEmbedUrl(fileUrl);
  const supported = isSupported(fileUrl);

  if (!supported || !embedUrl) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
        <div className="text-center">
          <ExternalLink className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-4">Preview not available for this file type</p>
          <Button variant="outline" size="sm" asChild>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative w-full h-[70vh] md:h-[80vh] lg:h-[85vh]">
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-200"
          allow="autoplay"
          allowFullScreen
          title={title}
        />
      </div>
      <div className="mt-2 flex items-center justify-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleFullscreenView}>
          <Maximize2 className="h-4 w-4 mr-2" />
          Full Screen
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in new tab
          </a>
        </Button>
      </div>
    </div>
  );
};

export default FileViewer;
