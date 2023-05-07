import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateResult } from "typeorm";

@Injectable()
export class AchievementsService{
    private readonly achievementsList = {
        FirstWin: 'FirstWin',
        FirstLoss: 'FirstLoss',
        WinStreak: 'WinStreak',
        ImBad: 'ImBad',
        ImTheBoss: 'ImTheBoss',
        TheDarkSide: 'TheDarkSide',
        ImCurious: 'ImCurious',      
        SecretAchievement: 'SecretAchievement',
      };
    constructor(private prisma: PrismaService) {}

    async updateAchievements(id: number, achievement: string) {
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
        this.getAchievements(id);
        if (user[field])
          return; // If the field is already true, we return
        const data: Record<string, boolean> = {}; // We create a new object with the field name as key
        data[field] = true; // We set the field to true
        console.log(`The user ${user.username} has unlocked the achievement ${achievement}`)
        return await this.prisma.user.update({
          where: {
            id: id,
          },
          data: data, // We update the user with the new data
        });
      }

        async getAchievements(id: number) {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: id,
                },
            });
            if (!user)
                throw new Error('User not found');
            const listAchievements = new Map<string, boolean>();
            for (const [key, value] of Object.entries(user)) // We iterate over the user object
                if (typeof value === 'boolean') // If the value is a boolean
                    listAchievements.set(key, value); // We add it to the map
            console.log(listAchievements);
            return listAchievements;
            }
    }