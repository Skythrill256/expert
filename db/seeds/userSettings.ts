import { db } from '@/db';
import { userSettings } from '@/db/schema';

async function main() {
    const sampleUserSettings = [
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            timezone: 'America/Los_Angeles',
            language: 'en',
            theme: 'dark',
            emailNotifications: true,
            pushNotifications: true,
            weeklyReports: true,
            recommendationsNotifications: true,
            createdAt: new Date('2024-01-15T10:00:00Z'),
            updatedAt: new Date('2024-01-15T10:00:00Z'),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            timezone: 'America/New_York',
            language: 'es',
            theme: 'light',
            emailNotifications: true,
            pushNotifications: false,
            weeklyReports: true,
            recommendationsNotifications: false,
            createdAt: new Date('2024-01-20T14:30:00Z'),
            updatedAt: new Date('2024-01-20T14:30:00Z'),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r6',
            timezone: 'UTC',
            language: 'en',
            theme: 'dark',
            emailNotifications: false,
            pushNotifications: false,
            weeklyReports: false,
            recommendationsNotifications: true,
            createdAt: new Date('2024-02-01T08:15:00Z'),
            updatedAt: new Date('2024-02-01T08:15:00Z'),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r7',
            timezone: 'Europe/London',
            language: 'fr',
            theme: 'light',
            emailNotifications: true,
            pushNotifications: true,
            weeklyReports: false,
            recommendationsNotifications: true,
            createdAt: new Date('2024-02-05T16:45:00Z'),
            updatedAt: new Date('2024-02-05T16:45:00Z'),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r8',
            timezone: 'America/Los_Angeles',
            language: 'en',
            theme: 'dark',
            emailNotifications: false,
            pushNotifications: true,
            weeklyReports: true,
            recommendationsNotifications: false,
            createdAt: new Date('2024-02-10T12:20:00Z'),
            updatedAt: new Date('2024-02-10T12:20:00Z'),
        }
    ];

    await db.insert(userSettings).values(sampleUserSettings);
    
    console.log('✅ User settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});