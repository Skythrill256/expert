import { db } from '@/db';
import { lifestyleLogs } from '@/db/schema';

async function main() {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);
    
    const sampleLogs = [];
    
    // User 1 (Alex) - Consistent lifestyle
    for (let i = 0; i < 30; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Alex's consistent patterns with some variation
        const sleepHours = 7 + Math.round(Math.random() * 2 * 10) / 10; // 7.0-8.0 hours
        const exerciseMinutes = 30 + Math.floor(Math.random() * 31); // 30-60 minutes
        const dietQualities = ['good', 'good', 'good', 'excellent', 'good'];
        const dietQuality = dietQualities[Math.floor(Math.random() * dietQualities.length)];
        const stressLevels = ['low', 'low', 'medium', 'low'];
        const stressLevel = stressLevels[Math.floor(Math.random() * stressLevels.length)];
        const alcoholDrinks = Math.floor(Math.random() * 3); // 0-2 drinks
        
        const positiveNotes = [
            'Good workout today, feeling strong',
            'Ate well and got good sleep',
            'Consistent routine paying off',
            'Feeling energized and focused',
            'Great day overall, stayed on track',
            'Morning workout was excellent',
            'Healthy meals all day',
            'Stress levels low, good balance'
        ];
        
        sampleLogs.push({
            id: `log_alex_${i + 1}`,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            logDate: dateStr,
            sleepHours: sleepHours,
            exerciseMinutes: exerciseMinutes,
            dietQuality: dietQuality,
            stressLevel: stressLevel,
            smoking: false,
            alcoholDrinks: alcoholDrinks,
            notes: positiveNotes[Math.floor(Math.random() * positiveNotes.length)],
            createdAt: new Date(currentDate.getTime() + 20 * 60 * 60 * 1000).toISOString() // 8 PM same day
        });
    }
    
    // User 2 (David) - More variable lifestyle
    for (let i = 0; i < 30; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // David's variable patterns
        const sleepHours = 6 + Math.round(Math.random() * 4 * 10) / 10; // 6.0-8.0 hours
        const exerciseMinutes = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 46); // 0-45 minutes, sometimes none
        const dietQualities = ['average', 'average', 'good', 'average', 'good'];
        const dietQuality = dietQualities[Math.floor(Math.random() * dietQualities.length)];
        const stressLevels = ['medium', 'high', 'medium', 'high'];
        const stressLevel = stressLevels[Math.floor(Math.random() * stressLevels.length)];
        const alcoholDrinks = 1 + Math.floor(Math.random() * 4); // 1-4 drinks
        
        const stressfulNotes = [
            'Stressful day at work, long hours',
            'Trying to improve diet habits',
            'Work deadline pressure is high',
            'Skipped workout due to overtime',
            'Ate fast food again, need to plan better',
            'Working late, disrupted sleep schedule',
            'Attempting lifestyle changes slowly',
            'Weekend was better, more balanced',
            'Conference calls all day, exhausting',
            'Managed to squeeze in some exercise'
        ];
        
        sampleLogs.push({
            id: `log_david_${i + 1}`,
            userId: 'user_02h5lyt3f9a8x4c2m8n7p6v9s5',
            logDate: dateStr,
            sleepHours: sleepHours,
            exerciseMinutes: exerciseMinutes,
            dietQuality: dietQuality,
            stressLevel: stressLevel,
            smoking: false,
            alcoholDrinks: alcoholDrinks,
            notes: stressfulNotes[Math.floor(Math.random() * stressfulNotes.length)],
            createdAt: new Date(currentDate.getTime() + 21 * 60 * 60 * 1000).toISOString() // 9 PM same day
        });
    }
    
    await db.insert(lifestyleLogs).values(sampleLogs);
    
    console.log('✅ Lifestyle logs seeder completed successfully - Generated 60 logs (30 days for 2 users)');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});