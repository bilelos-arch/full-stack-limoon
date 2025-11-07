"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
const path_1 = require("path");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cookieParser());
    app.enableCors({
        origin: [
            'https://full-stack-limoon-t4jt.vercel.app',
            'http://localhost:3000',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization',
    });
    app.use('/uploads', express.static((0, path_1.join)(process.cwd(), 'uploads')));
    app.use('/uploads/previews', express.static((0, path_1.join)(process.cwd(), 'uploads/previews')));
    app.use('/uploads/temp-previews', express.static((0, path_1.join)(process.cwd(), 'uploads/temp-previews')));
    app.use('/temp-previews', express.static((0, path_1.join)(process.cwd(), 'uploads/temp-previews')));
    await app.listen(process.env.PORT || 10000);
}
bootstrap();
//# sourceMappingURL=main.js.map