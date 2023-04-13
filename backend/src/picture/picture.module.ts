import { Module } from "@nestjs/common";
import { UserModule } from "src/user/user.module";
import { PictureController } from "./picture.controller";
import { PictureService } from "./picture.service";

@Module({
    imports: [UserModule],
    controllers: [PictureController],
    providers: [PictureService],})
export class PictureModule {}