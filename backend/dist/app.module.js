"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const auth_module_1 = require("./auth.module");
const users_module_1 = require("./users.module");
const templates_module_1 = require("./templates.module");
const testimonials_module_1 = require("./testimonials.module");
const histoires_module_1 = require("./histoires/histoires.module");
const admin_controller_1 = require("./admin.controller");
const histoire_schema_1 = require("./histoires/schemas/histoire.schema");
const user_schema_1 = require("./user.schema");
const template_schema_1 = require("./template.schema");
const testimonial_schema_1 = require("./testimonial.schema");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://bilelos00:Kaspersky002@myapp.h9fam1j.mongodb.net/'),
            mongoose_1.MongooseModule.forFeature([
                { name: histoire_schema_1.Histoire.name, schema: histoire_schema_1.HistoireSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: template_schema_1.Template.name, schema: template_schema_1.TemplateSchema },
                { name: testimonial_schema_1.Testimonial.name, schema: testimonial_schema_1.TestimonialSchema }
            ]),
            testimonials_module_1.TestimonialsModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            templates_module_1.TemplatesModule,
            histoires_module_1.HistoiresModule,
        ],
        controllers: [admin_controller_1.AdminController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map