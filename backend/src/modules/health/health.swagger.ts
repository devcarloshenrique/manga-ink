/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Verifica o estado da aplicação
 *     description: Retorna o status atual da API, incluindo timestamp e versão. Útil para monitoramento e health checks.
 *     responses:
 *       200:
 *         description: Aplicação está funcionando normalmente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                   description: Estado atual da aplicação
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-05-01T21:00:00.000Z"
 *                   description: Data e hora da verificação
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                   description: Versão atual da API
 *                 uptime:
 *                   type: number
 *                   example: 1234.56
 *                   description: Tempo de execução da aplicação em segundos
 */