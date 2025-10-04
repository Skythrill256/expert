import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { userProfile } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Flatten the nested lifestyle_data
    const profileData = {
      id: crypto.randomUUID(),
      userId,
      age: data.age,
      heightFeet: data.height_feet,
      heightInches: data.height_inches,
      weight: data.weight,
      profilePhoto: data.profile_photo || null,
      fertilityGoal: data.fertility_goal,
      smoking: data.lifestyle_data.smoking,
      alcohol: data.lifestyle_data.alcohol,
      exercise: data.lifestyle_data.exercise,
      dietQuality: data.lifestyle_data.diet_quality,
      sleepHours: data.lifestyle_data.sleep_hours,
      stressLevel: data.lifestyle_data.stress_level,
      masturbationFrequency: data.lifestyle_data.masturbation_frequency,
      sexualActivity: data.lifestyle_data.sexual_activity,
      supplements: data.lifestyle_data.supplements,
      careerStatus: data.lifestyle_data.career_status,
      familyPledge: data.lifestyle_data.family_pledge,
      tightClothing: data.lifestyle_data.tight_clothing,
      hotBaths: data.lifestyle_data.hot_baths,
      onboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId))
      .limit(1);

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(userProfile)
        .set({
          ...profileData,
          id: existingProfile[0].id, // Keep the existing ID
          updatedAt: new Date(),
        })
        .where(eq(userProfile.userId, userId));
    } else {
      // Insert new profile
      await db.insert(userProfile).values(profileData);
    }

    return NextResponse.json({ success: true, message: 'Onboarding completed' });
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ completed: false });
    }

    console.log('API returning profile data:', JSON.stringify(profile[0], null, 2));

    return NextResponse.json({ 
      completed: profile[0].onboardingCompleted,
      profile: profile[0]
    });
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding data' },
      { status: 500 }
    );
  }
}