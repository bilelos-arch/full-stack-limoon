"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHistoireDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_histoire_dto_1 = require("./create-histoire.dto");
class UpdateHistoireDto extends (0, mapped_types_1.PartialType)(create_histoire_dto_1.CreateHistoireDto) {
}
exports.UpdateHistoireDto = UpdateHistoireDto;
//# sourceMappingURL=update-histoire.dto.js.map