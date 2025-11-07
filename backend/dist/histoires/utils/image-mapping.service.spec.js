"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const image_mapping_service_1 = require("./image-mapping.service");
const fs = require("fs");
const path = require("path");
describe('ImageMappingService', () => {
    let service;
    let testDir;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [image_mapping_service_1.ImageMappingService],
        }).compile();
        service = module.get(image_mapping_service_1.ImageMappingService);
        testDir = './test-uploads';
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
    });
    afterEach(() => {
        if (fs.existsSync(testDir)) {
            const files = fs.readdirSync(testDir);
            files.forEach(file => {
                fs.unlinkSync(path.join(testDir, file));
            });
            fs.rmdirSync(testDir);
        }
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('findImageByVariable', () => {
        it('should find image by exact filename match', async () => {
            const testFile = path.join(testDir, 'photo-1234567890-123456789.png');
            fs.writeFileSync(testFile, 'test image content');
            const result = await service.findImageByVariable('photo', 'photo-1234567890-123456789.png', [testFile]);
            expect(result.found).toBe(true);
            expect(result.imagePath).toBe(testFile);
            expect(result.filename).toBe('photo-1234567890-123456789.png');
        });
        it('should find image by variable prefix', async () => {
            const testFile = path.join(testDir, 'personnage-1234567890-987654321.jpg');
            fs.writeFileSync(testFile, 'test image content');
            const result = await service.findImageByVariable('personnage', 'personnage-1234567890-987654321.jpg', [testFile]);
            expect(result.found).toBe(true);
            expect(result.imagePath).toBe(testFile);
        });
        it('should return not found for non-existent image', async () => {
            const result = await service.findImageByVariable('photo', 'nonexistent.jpg', []);
            expect(result.found).toBe(false);
            expect(result.error).toContain('Image not found');
        });
    });
    describe('validateImageExists', () => {
        it('should validate existing image file', () => {
            const testFile = path.join(testDir, 'test.png');
            fs.writeFileSync(testFile, 'test image content');
            const result = service.validateImageExists(testFile);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
        });
        it('should reject non-existent file', () => {
            const nonExistentFile = path.join(testDir, 'nonexistent.png');
            const result = service.validateImageExists(nonExistentFile);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('does not exist');
        });
        it('should reject empty file', () => {
            const emptyFile = path.join(testDir, 'empty.png');
            fs.writeFileSync(emptyFile, '');
            const result = service.validateImageExists(emptyFile);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('empty');
        });
        it('should reject non-image file', () => {
            const textFile = path.join(testDir, 'test.txt');
            fs.writeFileSync(textFile, 'text content');
            const result = service.validateImageExists(textFile);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('not a valid image');
        });
    });
    describe('listAvailableImages', () => {
        it('should list images from all directories', () => {
            const imageFiles = ['test1.jpg', 'test2.png', 'document.pdf'];
            imageFiles.forEach((filename, index) => {
                fs.writeFileSync(path.join(testDir, filename), `content ${index}`);
            });
            const result = service.listAvailableImages();
            expect(Array.isArray(result)).toBe(true);
            const directories = result.map(d => d.directory);
            expect(directories).toContain('temp-images');
            expect(directories).toContain('histoires-images');
            expect(directories).toContain('uploads');
        });
    });
    describe('extractBaseFilename', () => {
        it('should extract base filename correctly', () => {
            const serviceAny = service;
            const testCases = [
                { input: 'photo-1234567890-123456789.png', expected: 'photo.png' },
                { input: 'personnage-9876543210-987654321.jpg', expected: 'personnage.jpg' },
                { input: 'simple.png', expected: 'simple.png' },
            ];
            testCases.forEach(testCase => {
                const result = serviceAny.extractBaseFilename(testCase.input);
                expect(result).toBe(testCase.expected);
            });
        });
    });
    describe('isImageFile', () => {
        it('should correctly identify image files', () => {
            const serviceAny = service;
            const imageFiles = ['test.jpg', 'test.jpeg', 'test.png', 'test.gif', 'test.webp'];
            const nonImageFiles = ['test.txt', 'test.pdf', 'test.doc', 'test.exe'];
            imageFiles.forEach(filename => {
                expect(serviceAny.isImageFile(filename)).toBe(true);
            });
            nonImageFiles.forEach(filename => {
                expect(serviceAny.isImageFile(filename)).toBe(false);
            });
        });
    });
});
//# sourceMappingURL=image-mapping.service.spec.js.map