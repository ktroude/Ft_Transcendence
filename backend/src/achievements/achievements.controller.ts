import { Controller, Get, Put, UseGuards, Param, Body } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard";
import { AchievementsService } from "./achievements.service";

@Controller('/users/achievements')
export class AchievementsController {
    constructor(private achievementsService: AchievementsService) {}

    @UseGuards(JwtGuard)
    @Get(':id/getAchievements')
    async getAchievements(@Param('id') id: number) : Promise<Map<String, Boolean>>{
		let all_achievements = new Map<string, Boolean>();
		all_achievements = await this.achievementsService.getAchievements(Number(id));
		console.log("*****************************************");
		console.log(all_achievements);
		console.log("*****************************************");
        return  all_achievements;
    }

    @UseGuards(JwtGuard)
    @Put(':id/updateAchievements')
    async updateAchievements(@Param('id') id: number, @Body() body: any) {
        return await this.achievementsService.updateAchievements(Number(id), body.achievement);
      }
}