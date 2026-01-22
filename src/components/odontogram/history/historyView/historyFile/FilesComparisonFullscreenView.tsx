// src/components/odontogram/history/historyView/historyFile/FilesComparisonFullscreenView.tsx
import { useState, useEffect } from 'react';
import { 
  X, Maximize2, Minimize2, ChevronLeft, ChevronRight, Grid, List,
  Download, Eye, Calendar, Filter, Search, ZoomIn, ZoomOut,
  Split, Columns, SidebarClose, SidebarOpen
} from 'lucide-react';
import type { ClinicalFile } from '../../../../../services/clinicalFiles/clinicalFilesService';

interface FilesComparisonFullscreenViewProps {
  beforeFiles: ClinicalFile[];
  afterFiles: ClinicalFile[];
  beforeSnapshotDate: Date;
  afterSnapshotDate: Date;
  onClose: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (mimetype: string) => {
  if (mimetype.startsWith('image/')) return '🖼️';
  if (mimetype === 'application/pdf') return '📄';
  if (mimetype.includes('video')) return '🎥';
  if (mimetype.includes('zip') || mimetype.includes('compressed')) return '📦';
  return '📁';
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'XRAY': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'PHOTO': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'LAB': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'MODEL_3D': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    'OTHER': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };
  return colors[category] || colors.OTHER;
};

export const FilesComparisonFullscreenView: React.FC<FilesComparisonFullscreenViewProps> = ({
  beforeFiles,
  afterFiles,
  beforeSnapshotDate,
  afterSnapshotDate,
  onClose,
}) => {
  const [layout, setLayout] = useState<'split' | 'before' | 'after'>('split');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBeforeFile, setSelectedBeforeFile] = useState<string | null>(null);
  const [selectedAfterFile, setSelectedAfterFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [zoomBefore, setZoomBefore] = useState(1);
  const [zoomAfter, setZoomAfter] = useState(1);
  const [showSidebar, setShowSidebar] = useState(true);

  // Filtrado de archivos
  const filteredBeforeFiles = beforeFiles.filter(file => {
    const matchesSearch = file.original_filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredAfterFiles = afterFiles.filter(file => {
    const matchesSearch = file.original_filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Categorías únicas
  const categories = Array.from(new Set([
    ...beforeFiles.map(f => f.category),
    ...afterFiles.map(f => f.category)
  ]));

  // Resetear zoom al cambiar archivo
  useEffect(() => {
    setZoomBefore(1);
    setZoomAfter(1);
  }, [selectedBeforeFile, selectedAfterFile]);

  // Obtener archivos seleccionados
  const selectedBefore = beforeFiles.find(f => f.id === selectedBeforeFile);
  const selectedAfter = afterFiles.find(f => f.id === selectedAfterFile);

  // Controlar navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        // Navegar anterior
      }
      if (e.key === 'ArrowRight') {
        // Navegar siguiente
      }
      if (e.key === 'f') {
        // Toggle fullscreen
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Renderizar vista previa de archivo
  const renderFilePreview = (file: ClinicalFile, side: 'before' | 'after', zoom: number) => {
    if (!file) return null;

    const isImage = file.mime_type.startsWith('image/');
    const isPDF = file.mime_type === 'application/pdf';
    const zoomLevel = side === 'before' ? zoomBefore : zoomAfter;

    return (
      <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
        {isImage ? (
          <div className="relative w-full h-full overflow-auto">
            <img
              src={file.file_url}
              alt={file.original_filename}
              className="object-contain transition-transform duration-200"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center'
              }}
            />
          </div>
        ) : isPDF ? (
          <iframe
            src={file.file_url}
            className="w-full h-full border-0"
            title={file.original_filename}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <div className="text-4xl mb-4">{getFileIcon(file.mime_type)}</div>
              <p className="text-lg font-medium">{file.original_filename}</p>
              <p className="text-sm text-gray-400">{formatFileSize(file.file_size_bytes)}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderizar lista de archivos
  const renderFileList = (files: ClinicalFile[], side: 'before' | 'after') => {
    const selectedFile = side === 'before' ? selectedBeforeFile : selectedAfterFile;
    const setSelectedFile = side === 'before' ? setSelectedBeforeFile : setSelectedAfterFile;

    return (
      <div className={`h-full overflow-y-auto custom-scrollbar ${
        viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4' : 'space-y-2 p-4'
      }`}>
        {files.map(file => (
          <div
            key={file.id}
            onClick={() => setSelectedFile(file.id)}
            className={`
              cursor-pointer transition-all duration-200 rounded-lg border-2 overflow-hidden
              ${selectedFile === file.id 
                ? side === 'before' 
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                  : 'border-green-500 ring-2 ring-green-200 dark:ring-green-800'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
              ${viewMode === 'grid' 
                ? 'aspect-square flex flex-col' 
                : 'flex items-center gap-3 p-3'
              }
            `}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <span className="text-3xl">{getFileIcon(file.mime_type)}</span>
                </div>
                <div className="p-2 bg-white dark:bg-gray-900">
                  <p className="text-xs font-medium truncate">{file.original_filename}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-gray-500">
                      {formatFileSize(file.file_size_bytes)}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${getCategoryColor(file.category)}`}>
                      {file.category}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl">{getFileIcon(file.mime_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.original_filename}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatFileSize(file.file_size_bytes)}</span>
                    <span>•</span>
                    <span className={`px-1.5 py-0.5 rounded ${getCategoryColor(file.category)}`}>
                      {file.category}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop con blur intenso */}
      <div className="fixed inset-0 z-[100] backdrop-blur-xl bg-black/80 transition-all duration-300" />
      
      {/* Contenedor principal */}
      <div className="fixed inset-0 z-[101] flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-6 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="font-medium">Antes</span>
                <span className="text-sm text-gray-500">
                  {beforeSnapshotDate.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}
                </span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                  {beforeFiles.length} archivos
                </span>
              </div>
              
              <div className="text-gray-400">→</div>
              
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="font-medium">Después</span>
                <span className="text-sm text-gray-500">
                  {afterSnapshotDate.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}
                </span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
                  {afterFiles.length} archivos
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar archivos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm w-64"
              />
            </div>
            
            {/* Filtro por categoría */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            {/* Botón toggle sidebar */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {showSidebar ? <SidebarClose className="h-5 w-5" /> : <SidebarOpen className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Sidebar con lista de archivos */}
          {showSidebar && (
            <div className="w-80 flex-shrink-0 flex flex-col bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium">Explorador de archivos</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Tabs para seleccionar vista */}
              <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setLayout('split')}
                  className={`flex-1 py-2 text-sm ${layout === 'split' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}`}
                >
                  Ambos
                </button>
                <button
                  onClick={() => setLayout('before')}
                  className={`flex-1 py-2 text-sm ${layout === 'before' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}`}
                >
                  Solo Antes
                </button>
                <button
                  onClick={() => setLayout('after')}
                  className={`flex-1 py-2 text-sm ${layout === 'after' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : ''}`}
                >
                  Solo Después
                </button>
              </div>
              
              {/* Listas de archivos */}
              <div className="flex-1 overflow-hidden">
                {(layout === 'split' || layout === 'before') && (
                  <div className="h-1/2 border-b border-gray-200 dark:border-gray-800">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">Antes</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {filteredBeforeFiles.length} archivos
                        </span>
                      </div>
                    </div>
                    {renderFileList(filteredBeforeFiles, 'before')}
                  </div>
                )}
                
                {(layout === 'split' || layout === 'after') && (
                  <div className="h-1/2">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">Después</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {filteredAfterFiles.length} archivos
                        </span>
                      </div>
                    </div>
                    {renderFileList(filteredAfterFiles, 'after')}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Área de visualización principal */}
          <div className="flex-1 flex gap-4">
            {/* Panel izquierdo (Antes) */}
            {(layout === 'split' || layout === 'before') && (
              <div className="flex-1 flex flex-col bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <div>
                      <h3 className="font-medium">Antes</h3>
                      <p className="text-xs text-gray-500">
                        {selectedBefore 
                          ? selectedBefore.original_filename 
                          : 'Selecciona un archivo'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomBefore(Math.max(0.5, zoomBefore - 0.25))}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="text-sm">{Math.round(zoomBefore * 100)}%</span>
                    <button
                      onClick={() => setZoomBefore(Math.min(3, zoomBefore + 0.25))}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    
                    {selectedBefore?.file_url && (
                      <a
                        href={selectedBefore.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 p-4">
                  {selectedBefore ? (
                    renderFilePreview(selectedBefore, 'before', zoomBefore)
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Selecciona un archivo de la lista
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Panel derecho (Después) */}
            {(layout === 'split' || layout === 'after') && (
              <div className="flex-1 flex flex-col bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <div>
                      <h3 className="font-medium">Después</h3>
                      <p className="text-xs text-gray-500">
                        {selectedAfter 
                          ? selectedAfter.original_filename 
                          : 'Selecciona un archivo'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomAfter(Math.max(0.5, zoomAfter - 0.25))}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="text-sm">{Math.round(zoomAfter * 100)}%</span>
                    <button
                      onClick={() => setZoomAfter(Math.min(3, zoomAfter + 0.25))}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    
                    {selectedAfter?.file_url && (
                      <a
                        href={selectedAfter.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 p-4">
                  {selectedAfter ? (
                    renderFilePreview(selectedAfter, 'after', zoomAfter)
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Selecciona un archivo de la lista
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer con estadísticas */}
        <div className="mt-4 px-6 py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-2xl">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-medium">Archivos mostrados:</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                  {filteredBeforeFiles.length} antes
                </span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                  {filteredAfterFiles.length} después
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Vista:</span>
                <button
                  onClick={() => setLayout('split')}
                  className={`px-3 py-1 rounded ${layout === 'split' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  <Split className="h-4 w-4 inline mr-1" />
                  Dividida
                </button>
                <button
                  onClick={() => setLayout('before')}
                  className={`px-3 py-1 rounded ${layout === 'before' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  Solo Antes
                </button>
                <button
                  onClick={() => setLayout('after')}
                  className={`px-3 py-1 rounded ${layout === 'after' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  Solo Después
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Volver a comparación
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};