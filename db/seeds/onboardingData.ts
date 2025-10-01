import { db } from '@/db';
import { onboardingData } from '@/db/schema';

async function main() {
    const sampleOnboardingData = [
        {
            id: 'onboarding_01h4kxt2e8z9y3b1n7m6q5w8r1',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            age: 29,
            dietQuality: 'good',
            sleepHours: 7.5,
            exerciseFrequency: 'regularly',
            smoking: false,
            alcoholConsumption: 'light',
            stressLevel: 'medium',
            createdAt: new Date('2024-01-16').toISOString(),
            updatedAt: new Date('2024-01-16').toISOString(),
        },
        {
            id: 'onboarding_01h4kxt2e8z9y3b1n7m6q5w8r2',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            age: 32,
            dietQuality: 'average',
            sleepHours: 6.5,
            exerciseFrequency: 'occasionally',
            smoking: false,
            alcoholConsumption: 'moderate',
            stressLevel: 'high',
            createdAt: new Date('2024-01-17').toISOString(),
            updatedAt: new Date('2024-01-17').toISOString(),
        },
    ];

    await db.insert(onboardingData).values(sampleOnboardingData);
    
    console.log('✅ Onboarding data seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});