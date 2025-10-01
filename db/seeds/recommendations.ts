import { db } from '@/db';
import { recommendations } from '@/db/schema';

async function main() {
    const sampleRecommendations = [
        // User 1 (Alex) - optimization focus
        {
            id: 'rec_01h4kxt2e8z9y3b1n7m6q5w8r1',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            recommendationType: 'diet',
            title: 'Adopt Mediterranean Diet Pattern',
            description: 'Transition to a Mediterranean-style diet rich in olive oil, fish, nuts, and vegetables. This eating pattern has been shown to improve sperm quality through its anti-inflammatory properties and high antioxidant content. Focus on omega-3 rich fish 2-3 times per week, daily nuts, and extra virgin olive oil as your primary fat source.',
            priority: 'high',
            status: 'active',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            id: 'rec_01h4kxt2e8z9y3b1n7m6q5w8r2',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            recommendationType: 'supplements',
            title: 'Antioxidant Supplement Protocol',
            description: 'Begin a targeted antioxidant supplement regimen including Coenzyme Q10 (200mg daily), Vitamin C (1000mg daily), and Vitamin E (400 IU daily). These antioxidants help protect sperm from oxidative stress and DNA damage. Take with meals for optimal absorption and consider cycling every 3 months.',
            priority: 'high',
            status: 'active',
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            id: 'rec_01h4kxt2e8z9y3b1n7m6q5w8r3',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            recommendationType: 'stress',
            title: 'Advanced Stress Management Techniques',
            description: 'Implement a comprehensive stress management protocol including daily meditation (20 minutes), progressive muscle relaxation, and breathing exercises. Consider learning mindfulness-based stress reduction (MBSR) techniques. Chronic stress elevates cortisol levels which can negatively impact sperm production and quality.',
            priority: 'medium',
            status: 'active',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            id: 'rec_01h4kxt2e8z9y3b1n7m6q5w8r4',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            recommendationType: 'sleep',
            title: 'Optimize Sleep Quality for Hormonal Balance',
            description: 'Focus on sleep quality optimization through consistent sleep schedule, bedroom temperature control (65-68°F), and blue light reduction 2 hours before bed. Quality sleep is crucial for testosterone production and sperm regeneration. Consider blackout curtains and white noise machine for deeper sleep phases.',
            priority: 'high',
            status: 'active',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            id: 'rec_01h4kxt2e8z9y3b1n7m6q5w8r5',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            recommendationType: 'lifestyle',
            title: 'Heat Exposure Reduction Protocol',
            description: 'Minimize heat exposure to scrotal area by avoiding hot baths, saunas, and tight clothing. Switch to boxer briefs or boxers, avoid laptop on lap, and limit hot tub use. Elevated scrotal temperature can impair sperm production for up to 74 days (full sperm cycle).',
            priority: 'medium',
            status: 'completed',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-02-15').toISOString(),
        },
        {
            id: 'rec_01h4kxt2e8z9y3b1n7m6q5w8r6',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            recommendationType: 'exercise',
            title: 'Moderate Exercise Optimization',
            description: 'Maintain moderate-intensity exercise 4-5 times per week, focusing on resistance training and cardio balance. Avoid excessive endurance training which can lower testosterone. Include compound movements like squats and deadlifts to naturally boost hormone production.',
            priority: 'medium',
            status: 'active',
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },

        // User 2 (David) - foundational changes
        {
            id: 'rec_01h4kxt2e8z9y3b1n7m6q5w8r7',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            recommendationType: 'lifestyle',
            title: 'Reduce Alcohol Consumption',
            description: 'Significantly reduce alcohol intake to no more than 2-3 drinks per week. Alcohol negatively affects testosterone production, sperm quality, and can cause oxidative stress. Replace evening drinks with herbal teas or sparkling water with lime. Consider alcohol-free alternatives for social situations.',
            priority: 'critical',
            status: 'active',
            createdAt: new Date('2024-01-08').toISOString(),
            updatedAt: new Date('2024-01-08').toISOString(),
        },
        {
            id: 'rec_01h4kxt2e8z9y3b1n7m6q5w8r8',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            recommendationType: 'exercise',
            title: 'Establish Consistent Exercise Routine',
            description: 'Build a sustainable exercise habit starting with 3 days per week, 30 minutes each session. Begin with walking, light jogging, or bodyweight exercises. Consistency is more important than intensity initially. Track your workouts and gradually increase frequency and duration as habits form.',
            priority: 'high',
            status: 'active',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            id: 'rec_01h4kxt2e8z9y3b1n7m6q5w8r9',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            recommendationType: 'sleep',
            title: 'Improve Sleep Schedule Consistency',
            description: 'Establish a consistent sleep schedule by going to bed and waking up at the same time daily, including weekends. Aim for 7-9 hours of sleep. Create a bedtime routine starting 1 hour before sleep: dim lights, avoid screens, and practice relaxation techniques.',
            priority: 'high',
            status: 'active',
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            id: 'rec_01h4kxt2e8z9y3b1n7m6q5w8r10',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            recommendationType: 'stress',
            title: 'Basic Stress Reduction Techniques',
            description: 'Learn and practice fundamental stress reduction techniques including deep breathing exercises (4-7-8 technique), short daily walks, and basic mindfulness. Start with 5-10 minutes daily and gradually increase. High stress levels can significantly impact hormone production and sperm quality.',
            priority: 'medium',
            status: 'active',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            id: 'rec_01h4kxt2e8z9y3b1n7m6q5w8r11',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            recommendationType: 'diet',
            title: 'Increase Fruit and Vegetable Intake',
            description: 'Significantly increase daily consumption of fruits and vegetables to at least 5-7 servings per day. Focus on colorful produce rich in antioxidants like berries, leafy greens, tomatoes, and citrus fruits. These provide essential vitamins and minerals crucial for sperm health and production.',
            priority: 'medium',
            status: 'active',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            id: 'rec_01h4kxt2e8z9y3b1n7m6q5w8r12',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            recommendationType: 'supplements',
            title: 'Basic Multivitamin and Zinc Supplementation',
            description: 'Start with a high-quality multivitamin containing essential nutrients for male fertility, plus additional zinc supplementation (15-30mg daily). Zinc is crucial for testosterone production and sperm development. Take with food to avoid stomach upset.',
            priority: 'low',
            status: 'completed',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        },
        {
            id: 'rec_01h4kxt2e8z9y3b1n7m6q5w8r13',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            recommendationType: 'lifestyle',
            title: 'Smoking Cessation Support',
            description: 'If applicable, seek support for smoking cessation through counseling, nicotine replacement therapy, or prescription medications. Smoking dramatically reduces sperm count, motility, and increases DNA damage. The benefits for sperm quality begin within 2-3 months of quitting.',
            priority: 'critical',
            status: 'active',
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        }
    ];

    await db.insert(recommendations).values(sampleRecommendations);
    
    console.log('✅ Recommendations seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});