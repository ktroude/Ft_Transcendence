import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateResult } from "typeorm";
import { User } from "@prisma/client";

@Injectable()
export class AchievementsService{
    private readonly achievementsList = {
        FirstWin: 'FirstWin',
        WinStreak: 'WinStreak',
        ImTheBoss: 'ImTheBoss',
        TheDarkSide: 'TheDarkSide',
        ImCurious: 'ImCurious',      
      };
    constructor(private prisma: PrismaService) {}

    async updateAchievements(id: number, achievement: string): Promise<User>{
        const user = await this.prisma.user.findUnique({
          where: {
            id: id,
          },
        });
        if (!user) {
          throw new Error('User not found');
        }
    
        const field = this.achievementsList[achievement]; // We get the field name from the achievement name
        if (!field) {
          throw new Error('Invalid achievement');
        }
        if (user[field] === true)
          return; // If the field is already true, we return
        const data: Record<string, boolean> = {}; // We create a new object with the field name as key
        data[field] = true; // We set the field to true
        return await this.prisma.user.update({
          where: {
            id: id,
          },
          data: data, // We update the user with the new data
        });
      }

          async getAchievements(id: number): Promise<[string, boolean][]>{ // We return an array of [string, boolean] (achievement name, achievement value)
            const user = await this.prisma.user.findUnique({
              where: {
                id: id,
              },
            });
          
            if (!user) {
              throw new Error('User not found');
            }
          
            const achievements = [];        
            for (const key of Object.values(this.achievementsList)) {
              if (typeof user[key] === 'boolean') {
                achievements.push([key, user[key]]);
              }
            }
            return achievements;
        }
    }