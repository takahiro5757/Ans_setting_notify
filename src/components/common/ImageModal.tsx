'use client';

import React from 'react';
import {
  Dialog,
  Box,
  Avatar,
  IconButton,
  Fade,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface ImageModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
  showDownload?: boolean;
}

/**
 * 画像表示モーダルコンポーネント
 * 画像を拡大表示するためのポップアップモーダル
 */
const ImageModal: React.FC<ImageModalProps> = ({
  open,
  onClose,
  imageUrl,
  altText = 'プロフィール画像',
  showDownload = false
}) => {
  // 画像ダウンロード機能
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${altText.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ESCキーでモーダルを閉じる
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
          maxWidth: 'none',
          maxHeight: 'none',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(2px)',
        }
      }}
      onKeyDown={handleKeyDown}
      aria-labelledby="image-modal-title"
      aria-describedby="image-modal-description"
    >
      <Fade in={open} timeout={300}>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 0,
            outline: 'none',
          }}
          role="img"
          aria-label={altText}
        >
          {/* メイン画像 */}
          <Avatar
            src={imageUrl}
            alt={altText}
            sx={{
              width: 300,
              height: 300,
              border: '4px solid white',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          />

          {/* 閉じるボタン */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #e0e0e0',
              width: 40,
              height: 40,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.1)',
                borderColor: '#1976d2',
                transition: 'all 0.2s ease-in-out',
              },
              '&:focus': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px',
              },
            }}
            aria-label="画像を閉じる"
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* ダウンロードボタン（オプション） */}
          {showDownload && (
            <IconButton
              onClick={handleDownload}
              sx={{
                position: 'absolute',
                top: -20,
                left: -20,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid #e0e0e0',
                width: 40,
                height: 40,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  transform: 'scale(1.1)',
                  borderColor: '#4caf50',
                  transition: 'all 0.2s ease-in-out',
                },
                '&:focus': {
                  outline: '2px solid #4caf50',
                  outlineOffset: '2px',
                },
              }}
              aria-label="画像をダウンロード"
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          )}

          {/* 画像情報表示（スクリーンリーダー用） */}
          <Box
            id="image-modal-description"
            sx={{ position: 'absolute', left: -9999, top: -9999 }}
          >
            {altText}の拡大表示。ESCキーまたは閉じるボタンで閉じることができます。
          </Box>
        </Box>
      </Fade>
    </Dialog>
  );
};

export default ImageModal;



