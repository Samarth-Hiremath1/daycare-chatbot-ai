'use client';

import { Box, Button, Stack, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Daycare support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    const userMessage = message;
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: userMessage },
    ]);
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: userMessage }]),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMessage += decoder.decode(value, { stream: true });
      }
  
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: assistantMessage },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I'm out of free tokens. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f0f4f8"
      pb={4} // Added padding at the bottom
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid #ccc"
        borderRadius={8}
        p={2}
        spacing={3}
        bgcolor="white"
        boxShadow={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.light'
                    : 'secondary.light'
                }
                color="black"
                borderRadius={16}
                p={2}
                maxWidth="75%"
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Type your message..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
          />
          <IconButton
            color="primary"
            onClick={sendMessage}
            disabled={isLoading}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}


