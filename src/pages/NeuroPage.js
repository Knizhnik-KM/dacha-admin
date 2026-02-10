import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, CircularProgress, Alert } from '@mui/material';
import apiService from '../services/api';

const NeuroPage = () => {
  const [info, setInfo] = useState(null);
  const [testText, setTestText] = useState('Привет, нейросеть!');
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiService.openai.getInfo().then(res => setInfo(res.data));
  }, []);

  const handleTest = async () => {
    setLoading(true); setError(null); setTestResult(null);
    try {
      const res = await apiService.openai.testRequest({ text: testText });
      setTestResult(res.data);
    } catch (e) {
      setError('Ошибка при тестовом запросе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Нейросеть</Typography>
          <Divider sx={{ mb: 2 }} />
          {info && (
            <>
              <Typography>Провайдер: <b>{info.provider}</b></Typography>
              <Typography>Модель: <b>{info.model}</b></Typography>
              <Typography>Ключ API: <b>{info.apiKeySet ? 'Установлен' : 'Не установлен'}</b></Typography>
            </>
          )}
          <Box mt={2}>
            <Button variant="outlined" onClick={handleTest} disabled={loading}>Тестовый запрос</Button>
          </Box>
          <Box mt={2}>
            <TextField
              label="Тестовый текст"
              value={testText}
              onChange={e => setTestText(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              maxRows={6}
              sx={{ mb: 2 }}
            />
          </Box>
          {loading && <CircularProgress sx={{ mt: 2 }} />}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mt: 2 }}>
              <div>Ответ: {testResult.result}</div>
              {testResult.usage && <div>Usage: {JSON.stringify(testResult.usage)}</div>}
              {testResult.response_time_ms && <div>Время ответа: {testResult.response_time_ms} мс</div>}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NeuroPage; 