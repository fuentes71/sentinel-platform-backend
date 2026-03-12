- [NestJS](https://nestjs.com/)
- [JWT Authentication](https://jwt.io/introduction/)
- [WebSocket (Socket.IO)](https://socket.io/)
- [Class Validator](https://github.com/typestack/class-validator)
- [Arquitetura Modular](https://docs.nestjs.com/modules)

# Sentinel Platform (Backend)

Plataforma de monitoramento em tempo real para ativos fictícios,
com geração de eventos, engine de regras e alertas via WebSocket.

## Funcionalidades

- Autenticação com JWT
- RBAC (admin / user)
- Simulador de eventos (cron)
- Engine de regras simples
- Criação e resolução de alertas
- Comunicação em tempo real via WebSocket
- Eventos escopados por asset

## Arquitetura

- REST para comandos (login, cadastro, assets)
- WebSocket para eventos em tempo real
- Guards e decorators para autorização
- Separação clara entre domínio e transporte

## Segurança

- JWT obrigatório para HTTP e WS
- Ações administrativas protegidas por role
- Nenhuma confiança em dados do client

## WebSocket Events

### subscribe-asset

Assina eventos de um asset específico.

### alert-created

Emitido quando uma regra é violada.
Escopo: asset:{assetId}

### alert-resolved

Emitido quando um admin resolve um alerta.
Escopo: asset:{assetId}

## Como rodar

```bash
npm install
npm run start:dev
```
