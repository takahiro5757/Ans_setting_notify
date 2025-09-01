'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  IconButton,
  Slider,
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface ImageCropDialogProps {
  open: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: string) => void;
  originalImage: string;
  title?: string;
}

/**
 * 画像クロップダイアログコンポーネント
 * 円形クロップ機能付きの画像編集ダイアログ
 */
const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  open,
  onClose,
  onCropComplete,
  originalImage,
  title = '画像をクロップ'
}) => {
  // 状態管理
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.0); // 初期値を0%に
  const [baseScale, setBaseScale] = useState(1); // 0%時のスケール
  const [targetScale, setTargetScale] = useState(1); // 100%時のスケール
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [isPinching, setIsPinching] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // ズーム値から実際のスケールを計算
  const getActualScale = useCallback((zoomValue: number) => {
    return baseScale + (targetScale - baseScale) * zoomValue;
  }, [baseScale, targetScale]);

  // 画像読み込み完了時の処理
  const handleImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    const { naturalWidth, naturalHeight } = img;
    setImageSize({ width: naturalWidth, height: naturalHeight });
    
    // 画像を中央に配置
    const containerSize = 300;
    
    // 0%で画像をそのまま表示、100%で4倍サイズ
    const originalFitScale = Math.min(containerSize / naturalWidth, containerSize / naturalHeight);
    const calculatedTargetScale = originalFitScale * 4; // 4倍サイズ
    
    // スケール範囲を保存
    setBaseScale(originalFitScale);
    setTargetScale(calculatedTargetScale);
    
    // 初期ズームは0%に設定
    const initialZoom = 0.0;
    // 実際のスケール = 0%時のサイズ + (100%時のサイズ - 0%時のサイズ) * zoom
    const scale = originalFitScale + (calculatedTargetScale - originalFitScale) * initialZoom;
    
    const scaledWidth = naturalWidth * scale;
    const scaledHeight = naturalHeight * scale;
    
    setCrop({
      x: (containerSize - scaledWidth) / 2,
      y: (containerSize - scaledHeight) / 2
    });
    setZoom(initialZoom);
    setImageLoaded(true);
  }, []);

  // マウスダウンイベント
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y
    });
  }, [crop]);

  // マウス移動イベント
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setCrop({ x: newX, y: newY });
  }, [isDragging, dragStart]);

  // マウスアップイベント
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ホイールイベント（ポイント中心ズーム）
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const container = previewRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // ズーム倍率を調整（0%〜100%の範囲）
    const zoomDelta = e.deltaY > 0 ? -0.05 : 0.05; // 5%刻み
    const newZoom = Math.max(0.0, Math.min(1.0, zoom + zoomDelta));
    
    if (newZoom !== zoom) {
      // マウス位置を中心としたズーム
      const currentScale = getActualScale(zoom);
      const newScale = getActualScale(newZoom);
      const scaleRatio = newScale / currentScale;
      
      const newCropX = mouseX - (mouseX - crop.x) * scaleRatio;
      const newCropY = mouseY - (mouseY - crop.y) * scaleRatio;
      
      setCrop({ x: newCropX, y: newCropY });
      setZoom(newZoom);
    }
  }, [zoom, crop, getActualScale]);

  // 2点間の距離を計算
  const getTouchDistance = useCallback((touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // 2点の中心点を計算
  const getTouchCenter = useCallback((touch1: React.Touch, touch2: React.Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }, []);

  // タッチイベント（モバイル対応）
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // 単一タッチ（ドラッグ）
      const touch = e.touches[0];
      setIsDragging(true);
      setIsPinching(false);
      setDragStart({
        x: touch.clientX - crop.x,
        y: touch.clientY - crop.y
      });
    } else if (e.touches.length === 2) {
      // 2本指タッチ（ピンチズーム）
      setIsDragging(false);
      setIsPinching(true);
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setLastTouchDistance(distance);
    }
  }, [crop, getTouchDistance]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging && !isPinching) {
      // ドラッグ処理
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      setCrop({ x: newX, y: newY });
    } else if (e.touches.length === 2 && isPinching) {
      // ピンチズーム処理
      const container = previewRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const center = getTouchCenter(e.touches[0], e.touches[1]);
      
      if (lastTouchDistance > 0) {
        const touchScale = distance / lastTouchDistance;
        const newZoom = Math.max(0.0, Math.min(1.0, zoom * touchScale));
        
        if (newZoom !== zoom) {
          // タッチ中心点を基準にズーム
          const centerX = center.x - rect.left;
          const centerY = center.y - rect.top;
          const currentScale = getActualScale(zoom);
          const newScale = getActualScale(newZoom);
          const scaleRatio = newScale / currentScale;
          
          const newCropX = centerX - (centerX - crop.x) * scaleRatio;
          const newCropY = centerY - (centerY - crop.y) * scaleRatio;
          
          setCrop({ x: newCropX, y: newCropY });
          setZoom(newZoom);
        }
      }
      
      setLastTouchDistance(distance);
    }
  }, [isDragging, isPinching, dragStart, lastTouchDistance, zoom, crop, getActualScale, getTouchDistance, getTouchCenter]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setIsPinching(false);
    setLastTouchDistance(0);
  }, []);

  // グローバルマウスイベントの設定
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // クロップ適用
  const applyCrop = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // 背景をクリア
    ctx.clearRect(0, 0, size, size);

    // 円形クリッピングパスを作成
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    // 画像を描画
    const actualScale = getActualScale(zoom);
    const scaledWidth = imageSize.width * actualScale;
    const scaledHeight = imageSize.height * actualScale;
    
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      scaledWidth,
      scaledHeight
    );

    // Base64形式で取得
    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(base64);
    onClose();
  }, [crop, zoom, getActualScale, imageLoaded, imageSize, onCropComplete, onClose]);

  // リセット機能
  const handleReset = useCallback(() => {
    if (!imageLoaded) return;
    
    const containerSize = 300;
    const resetZoom = 0.0; // 0%にリセット
    const scale = getActualScale(resetZoom);
    
    const scaledWidth = imageSize.width * scale;
    const scaledHeight = imageSize.height * scale;
    
    setCrop({
      x: (containerSize - scaledWidth) / 2,
      y: (containerSize - scaledHeight) / 2
    });
    setZoom(resetZoom);
  }, [imageLoaded, imageSize, getActualScale]);

  // ズーム調整（中央基準）
  const handleZoomChange = useCallback((_: Event, newValue: number | number[]) => {
    const newZoom = newValue as number;
    if (newZoom === zoom) return;
    
    // プレビューエリアの中央を基準にズーム
    const containerSize = 300;
    const centerX = containerSize / 2;
    const centerY = containerSize / 2;
    
    const currentScale = getActualScale(zoom);
    const newScale = getActualScale(newZoom);
    const scaleRatio = newScale / currentScale;
    
    const newCropX = centerX - (centerX - crop.x) * scaleRatio;
    const newCropY = centerY - (centerY - crop.y) * scaleRatio;
    
    setCrop({ x: newCropX, y: newCropY });
    setZoom(newZoom);
  }, [zoom, crop, getActualScale]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: 500,
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            画像をドラッグして位置を調整し、ズームで大きさを調整してください
          </Typography>
        </Box>

        {!imageLoaded && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              画像を読み込み中...
            </Typography>
          </Box>
        )}

        {/* プレビューエリア */}
        <Box
          ref={previewRef}
          sx={{
            position: 'relative',
            width: 300,
            height: 300,
            margin: '0 auto',
            border: '2px dashed #ccc',
            borderRadius: '50%',
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            backgroundColor: '#f5f5f5',
          }}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 隠し画像（サイズ計算用） */}
          <img
            ref={imageRef}
            src={originalImage}
            alt="Original"
            style={{ display: 'none' }}
            onLoad={handleImageLoad}
          />

          {/* 表示用画像 */}
          {imageLoaded && (
            <img
              src={originalImage}
              alt="Crop preview"
              style={{
                position: 'absolute',
                left: crop.x,
                top: crop.y,
                width: imageSize.width * getActualScale(zoom),
                height: imageSize.height * getActualScale(zoom),
                pointerEvents: 'none',
                userSelect: 'none',
              }}
              draggable={false}
            />
          )}

          {/* 中央のガイドライン */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 2,
              height: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 20,
              height: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        </Box>

        {/* コントロールパネル */}
        {imageLoaded && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <ZoomOutIcon color="action" />
              <Slider
                value={zoom}
                onChange={handleZoomChange}
                min={0.0}
                max={1.0}
                step={0.05}
                sx={{ flex: 1 }}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              />
              <ZoomInIcon color="action" />
              <Typography variant="body2" sx={{ minWidth: 50 }}>
                {Math.round(zoom * 100)}%
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
              >
                リセット
              </Button>
            </Box>
          </Box>
        )}

        {/* 操作説明 */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            • 画像をドラッグして位置を調整<br/>
            • マウスホイールでポイント中心ズーム<br/>
            • スライダーで全体ズーム調整<br/>
            • モバイルでは2本指ピンチでズーム可能
          </Typography>
        </Alert>

        {/* 隠しCanvas（クロップ処理用） */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          キャンセル
        </Button>
        <Button
          onClick={applyCrop}
          variant="contained"
          disabled={!imageLoaded}
        >
          適用
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCropDialog;


