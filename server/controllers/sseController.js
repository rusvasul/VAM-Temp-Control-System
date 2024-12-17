const debug = require('debug')('app:sse');

const handleSSE = (req, res) => {
  debug('New SSE connection attempt');
  
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  debug('SSE headers set');

  // Send initial connection confirmation
  res.write('event: connected\n');
  res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);
  debug('Sent initial connection confirmation');

  // Keep connection alive with heartbeat
  const heartbeat = setInterval(() => {
    try {
      res.write('event: heartbeat\n');
      res.write(`data: ${Date.now()}\n\n`);
      debug('Heartbeat sent');
    } catch (error) {
      debug('Error sending heartbeat:', error);
      clearInterval(heartbeat);
    }
  }, 30000);

  // Handle client disconnect
  req.on('close', () => {
    debug('Client disconnected from SSE');
    clearInterval(heartbeat);
  });

  // Handle errors
  req.on('error', (error) => {
    debug('SSE connection error:', error);
    clearInterval(heartbeat);
    res.end();
  });

  // Handle response errors
  res.on('error', (error) => {
    debug('SSE response error:', error);
    clearInterval(heartbeat);
    res.end();
  });
};

module.exports = { handleSSE }; 