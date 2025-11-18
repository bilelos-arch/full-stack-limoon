"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.User = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let User = class User {
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], User.prototype, "birthDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            language: { type: String, default: 'fr' },
            theme: { type: String, default: 'light' },
            notifications: { type: Boolean, default: true }
        },
        default: {}
    }),
    __metadata("design:type", Object)
], User.prototype, "settings", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                id: String,
                title: String,
                createdAt: Date,
                category: String,
                language: String,
                link: String
            }],
        default: []
    }),
    __metadata("design:type", Array)
], User.prototype, "storyHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                id: String,
                productName: String,
                price: Number,
                date: Date,
                paymentMethod: String,
                status: String,
                invoiceUrl: String
            }],
        default: []
    }),
    __metadata("design:type", Array)
], User.prototype, "purchaseHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['admin', 'user'], default: 'user' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            name: String,
            age: String,
            gender: String,
            mood: String,
            hairType: String,
            hairColor: String,
            skinTone: String,
            eyes: String,
            eyebrows: String,
            mouth: String,
            glasses: Boolean,
            glassesStyle: String,
            accessories: String,
            earrings: String,
            features: String,
        }
    }),
    __metadata("design:type", Object)
], User.prototype, "child", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "childAvatar", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], User.prototype, "lastLogin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], User.prototype, "deletedAt", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
//# sourceMappingURL=user.schema.js.map