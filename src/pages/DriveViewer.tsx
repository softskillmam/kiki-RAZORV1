
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DriveViewer = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [searchParams] = useSearchParams();
  const title = searchParams.get('title') || 'Document Viewer';
  const backUrl = searchParams.get('back') || '/';

  if (!fileId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid File ID</h1>
              <p className="text-gray-600 mb-6">No file ID was provided.</p>
              <Link to="/">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const drivePreviewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  const driveDirectUrl = `https://drive.google.com/file/d/${fileId}/view`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={backUrl}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          
          <Button variant="outline" size="sm" asChild>
            <a href={driveDirectUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Google Drive
            </a>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="relative w-full" style={{ height: '80vh' }}>
              <iframe
                src={drivePreviewUrl}
                width="100%"
                height="100%"
                allow="autoplay"
                className="rounded-lg border-0"
                title={title}
                loading="lazy"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Having trouble viewing the document?{' '}
            <a 
              href={driveDirectUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-kiki-purple-600 hover:text-kiki-purple-700 underline"
            >
              Open in Google Drive
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriveViewer;
