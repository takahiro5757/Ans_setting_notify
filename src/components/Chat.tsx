'use client';

import { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { Message } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: uuidv4(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // TODO: AIエージェントの応答を実装
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          mb: 2,
          p: 2,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                color: message.role === 'user' ? 'white' : 'text.primary',
              }}
            >
              <Typography>{message.content}</Typography>
            </Paper>
          </Box>
        ))}
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="メッセージを入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleSend}
        >
          送信
        </Button>
      </Box>
    </Box>
  );
}; 