import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileSpreadsheet, Cloud, X, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  title: string;
  subtitle?: string;
  type: 'weather' | 'event';
}

interface UploadedFile {
  name: string;
  size: number;
  parsed: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

const typeConfig = {
  weather: {
    iconBg: 'bg-accent-teal/20',
    iconText: 'text-accent-teal',
    borderActive: 'border-accent-teal',
    bgActive: 'bg-accent-teal/10',
    fileIconBg: 'bg-accent-teal/20',
    fileIconText: 'text-accent-teal',
  },
  event: {
    iconBg: 'bg-accent-orange/20',
    iconText: 'text-accent-orange',
    borderActive: 'border-accent-orange',
    bgActive: 'bg-accent-orange/10',
    fileIconBg: 'bg-accent-orange/20',
    fileIconText: 'text-accent-orange',
  },
};

export default function FileUploader({ title, subtitle, type }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [parsing, setParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const config = typeConfig[type];

  const handleFile = (file: File) => {
    const validExtensions = ['.xlsx', '.xls'];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(extension)) {
      alert('请上传 .xlsx 或 .xls 格式的文件');
      return;
    }

    setParsing(true);
    setUploadedFile({ name: file.name, size: file.size, parsed: false });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        XLSX.read(data);
      } catch {
      } finally {
        setTimeout(() => {
          setUploadedFile(prev => prev ? { ...prev, parsed: true } : null);
          setParsing(false);
        }, 600);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = () => {
    setUploadedFile(null);
  };

  return (
    <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={cn('p-2 rounded-xl', config.iconBg)}>
          <FileSpreadsheet className={cn('w-5 h-5', config.iconText)} />
        </div>
        <div>
          <h3 className="text-white font-semibold text-base">{title}</h3>
          {subtitle && <p className="text-metal-400 text-xs">{subtitle}</p>}
        </div>
      </div>

      {uploadedFile ? (
        <div className={cn(
          'flex items-center justify-between p-4 rounded-xl border',
          uploadedFile.parsed ? 'bg-accent-teal/10 border-accent-teal/30' : 'bg-navy-700/40 border-navy-600/50'
        )}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn('p-2 rounded-lg flex-shrink-0', config.fileIconBg)}>
              <FileSpreadsheet className={cn('w-5 h-5', config.fileIconText)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{uploadedFile.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-metal-400 text-xs">{formatFileSize(uploadedFile.size)}</span>
                {uploadedFile.parsed && (
                  <span className="flex items-center gap-1 text-accent-teal text-xs">
                    <CheckCircle className="w-3 h-3" />
                    解析成功
                  </span>
                )}
                {!uploadedFile.parsed && parsing && (
                  <span className="text-metal-400 text-xs">解析中...</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-1.5 rounded-lg hover:bg-navy-600/50 text-metal-400 hover:text-white transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200',
            'p-8 flex flex-col items-center justify-center text-center',
            isDragging
              ? cn(config.borderActive, config.bgActive)
              : 'border-navy-600/50 bg-navy-900/30 hover:border-navy-500/60 hover:bg-navy-800/40'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleChange}
            className="hidden"
          />
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center mb-3',
            isDragging ? config.iconBg : 'bg-navy-700/60'
          )}>
            {isDragging ? (
              <Cloud className={cn('w-7 h-7', config.iconText)} />
            ) : (
              <Upload className={cn('w-7 h-7', config.iconText)} />
            )}
          </div>
          <p className="text-white text-sm font-medium mb-1">
            {isDragging ? '松开鼠标上传文件' : '拖拽文件到此处，或点击选择'}
          </p>
          <p className="text-metal-500 text-xs">仅支持 .xlsx / .xls 格式</p>
        </div>
      )}
    </div>
  );
}
