import express from "express";
import type { Express } from "express";
import cors from "cors";
import "dotenv/config";
import { prisma } from "./lib/prisma.js";

const app  : Express = express();
const PORT : number = 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Verificar se a API está funcionando
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Buscar usuários no PostgreSQL
app.get("/api/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);

    res.status(500).json({
      error: "Erro ao consultar usuários",
    });
  }
});

// Criar usuário no PostgreSQL
app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      res.status(400).json({
        error: "Nome e e-mail são obrigatórios",
      });
      return;
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    res.status(500).json({
      error: "Não foi possível criar o usuário",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});