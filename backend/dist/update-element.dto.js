"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateElementDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_element_dto_1 = require("./create-element.dto");
class UpdateElementDto extends (0, mapped_types_1.PartialType)(create_element_dto_1.CreateElementDto) {
}
exports.UpdateElementDto = UpdateElementDto;
//# sourceMappingURL=update-element.dto.js.map