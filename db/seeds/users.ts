import { db } from '@/db';
import { user } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            name: 'Alex Thompson',
            email: 'alex.thompson@gmail.com',
            emailVerified: true,
            image: null,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
        },
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            name: 'David Chen',
            email: 'david.chen@outlook.com',
            emailVerified: true,
            image: null,
            createdAt: new Date('2024-01-20'),
            updatedAt: new Date('2024-01-20'),
        }
    ];

    await db.insert(user).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});