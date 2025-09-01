'use client';

import React, { useState } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import ImageModal from './ImageModal';

interface AvatarWithPreviewProps {
  /** プロフィール画像のURL（Base64またはURL） */
  imageUrl?: string;
  /** 代替テキスト */
  altText?: string;
  /** アバターのサイズ */
  size?: number;
  /** 編集可能かどうか */
  editable?: boolean;
  /** 編集ボタンクリック時のコールバック */
  onEditClick?: () => void;
  /** クリック無効化 */
  disableClick?: boolean;
  /** 追加のスタイル */
  sx?: object;
}

/**
 * クリック可能なアバターコンポーネント
 * 画像クリックで拡大表示、編集ボタンで画像変更が可能
 */
const AvatarWithPreview: React.FC<AvatarWithPreviewProps> = ({
  imageUrl,
  altText = 'プロフィール画像',
  size = 48,
  editable = false,
  onEditClick,
  disableClick = false,
  sx = {},
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  // 画像モーダルを開く
  const handleImageClick = () => {
    if (!disableClick && imageUrl) {
      setModalOpen(true);
    }
  };

  // 画像モーダルを閉じる
  const handleModalClose = () => {
    setModalOpen(false);
  };

  // 編集ボタンクリック
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素のクリックイベントを防ぐ
    if (onEditClick) {
      onEditClick();
    }
  };

  // アバターの基本スタイル
  const avatarStyle = {
    width: size,
    height: size,
    cursor: !disableClick && imageUrl ? 'pointer' : 'default',
    transition: 'all 0.2s ease-in-out',
    border: '2px solid transparent',
    ...(!disableClick && imageUrl && {
      '&:hover': {
        opacity: 0.8,
        transform: 'scale(1.05)',
        borderColor: 'primary.main',
      },
    }),
    ...sx,
  };

  const AvatarComponent = (
    <Avatar
      src={imageUrl}
      alt={altText}
      sx={avatarStyle}
      onClick={handleImageClick}
    >
      {!imageUrl && <PersonIcon sx={{ fontSize: size * 0.6 }} />}
    </Avatar>
  );

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      {/* メインアバター */}
      {imageUrl && !disableClick ? (
        <Tooltip title="クリックして拡大表示" arrow>
          {AvatarComponent}
        </Tooltip>
      ) : (
        AvatarComponent
      )}

      {/* 編集ボタン（編集可能な場合のみ表示） */}
      {editable && (
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Tooltip title={imageUrl ? '画像を変更' : '画像を追加'} arrow>
              <IconButton
                size="small"
                onClick={handleEditClick}
                sx={{
                  width: size * 0.35,
                  height: size * 0.35,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    transform: 'scale(1.1)',
                  },
                  '&:focus': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                  },
                }}
                aria-label={imageUrl ? '画像を変更' : '画像を追加'}
              >
                {imageUrl ? (
                  <EditIcon sx={{ fontSize: size * 0.2 }} />
                ) : (
                  <PhotoCameraIcon sx={{ fontSize: size * 0.2 }} />
                )}
              </IconButton>
            </Tooltip>
          }
        />
      )}

      {/* 画像拡大表示モーダル */}
      {imageUrl && (
        <ImageModal
          open={modalOpen}
          onClose={handleModalClose}
          imageUrl={imageUrl}
          altText={altText}
          showDownload={false}
        />
      )}
    </Box>
  );
};

export default AvatarWithPreview;


