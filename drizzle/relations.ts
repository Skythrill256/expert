import { relations } from "drizzle-orm/relations";
import { user, lifestyleLogs, onboardingData, recommendations, shareLinks, spermReports, userSettings, userProfile } from "./schema";

export const lifestyleLogsRelations = relations(lifestyleLogs, ({one}) => ({
	user: one(user, {
		fields: [lifestyleLogs.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	lifestyleLogs: many(lifestyleLogs),
	onboardingData: many(onboardingData),
	recommendations: many(recommendations),
	shareLinks: many(shareLinks),
	spermReports: many(spermReports),
	userSettings: many(userSettings),
	userProfiles: many(userProfile),
}));

export const onboardingDataRelations = relations(onboardingData, ({one}) => ({
	user: one(user, {
		fields: [onboardingData.userId],
		references: [user.id]
	}),
}));

export const recommendationsRelations = relations(recommendations, ({one}) => ({
	user: one(user, {
		fields: [recommendations.userId],
		references: [user.id]
	}),
}));

export const shareLinksRelations = relations(shareLinks, ({one}) => ({
	user: one(user, {
		fields: [shareLinks.userId],
		references: [user.id]
	}),
}));

export const spermReportsRelations = relations(spermReports, ({one}) => ({
	user: one(user, {
		fields: [spermReports.userId],
		references: [user.id]
	}),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	user: one(user, {
		fields: [userSettings.userId],
		references: [user.id]
	}),
}));

export const userProfileRelations = relations(userProfile, ({one}) => ({
	user: one(user, {
		fields: [userProfile.userId],
		references: [user.id]
	}),
}));