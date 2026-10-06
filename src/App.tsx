import React, { useState } from 'react';
import { Sidebar, NavPage } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { ImageTo3DView } from './components/ImageTo3DView';
import { ReconstructionStudio } from './components/ReconstructionStudio';
import { PromptTo3DView } from './components/PromptTo3DView';
import { AssetLibraryView } from './components/AssetLibraryView';
import { SettingsView } from './components/SettingsView';
import { UploadedImageInfo, ImageAnalysisResult } from './types';
import { DEMO_IMAGES } from './data/demoImages';

export default function App() {
  const [activePage, setActivePage] = useState<NavPage>('image-to-3d');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active 3D Reconstruction Session
  const [activeImageInfo, setActiveImageInfo] = useState<UploadedImageInfo | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<ImageAnalysisResult | null>(null);

  // Handle Continuing to 3D Reconstruction from ImageTo3DView
  const handleContinueTo3D = (imageInfo: UploadedImageInfo, analysis: ImageAnalysisResult) => {
    setActiveImageInfo(imageInfo);
    setActiveAnalysis(analysis);
    setActivePage('3d-studio');
  };

  // Handle Starting Over
  const handleStartOver = () => {
    setActiveImageInfo(null);
    setActiveAnalysis(null);
    setActivePage('image-to-3d');
  };

  // Quick Try Demo from TopNav
  const handleQuickTryDemo = () => {
    const demo = DEMO_IMAGES[0];
    const syntheticInfo: UploadedImageInfo = {
      dataUrl: demo.thumbnail,
      name: `${demo.id}.svg`,
      size: 24500,
      width: 400,
      height: 400,
      type: 'image/svg+xml',
    };
    handleContinueTo3D(syntheticInfo, demo.analysis);
  };

  // Render main page content
  const renderContent = () => {
    switch (activePage) {
      case 'image-to-3d':
        return (
          <ImageTo3DView
            onContinueTo3D={handleContinueTo3D}
          />
        );

      case '3d-studio':
        // If no image is loaded yet, provide the default Gaming Chair demo
        const currentImage = activeImageInfo || {
          dataUrl: DEMO_IMAGES[0].thumbnail,
          name: `${DEMO_IMAGES[0].id}.svg`,
          size: 24500,
          width: 400,
          height: 400,
          type: 'image/svg+xml',
        };
        const currentAnalysis = activeAnalysis || DEMO_IMAGES[0].analysis;

        return (
          <ReconstructionStudio
            imageInfo={currentImage}
            analysis={currentAnalysis}
            onStartOver={handleStartOver}
          />
        );

      case 'prompt-to-3d':
        return (
          <PromptTo3DView
            onOpenInStudio={handleContinueTo3D}
          />
        );

      case 'asset-library':
        return (
          <AssetLibraryView
            onSelectAsset={handleContinueTo3D}
          />
        );

      case 'settings':
        return <SettingsView />;

      default:
        return (
          <ImageTo3DView
            onContinueTo3D={handleContinueTo3D}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#ededed] overflow-hidden font-sans antialiased selection:bg-[#00f2ff] selection:text-black">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 h-full overflow-hidden">
        {/* Top Navbar */}
        <TopNav
          activePage={activePage}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onQuickTryDemo={handleQuickTryDemo}
        />

        {/* Dynamic Page Workspace */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
