const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let orders = [];

app.post('/orders', (req, res) => {
  const order = { id: orders.length + 1, ...req.body, receivedAt: new Date().toISOString() };
  orders.push(order);
  console.log('Recebido pedido:', order);
  res.status(201).json({ ok: true, order });
});

app.get('/orders', (req, res) => res.json({ orders }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mock API rodando em http://localhost:${PORT}`));