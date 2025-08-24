
export const Role = ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'] as const;

export const AuthProvider = ['GOOGLE', 'APPLE', 'EMAIL', 'FACEBOOK'] as const;

export const CapLevel = ['GREEN', 'YELLOW', 'RED', 'BLACK', 'OSTRICH_FEATHER'] as const;

export const MediaType = ['TEXT', 'IMAGE', 'VIDEO'] as const;

export const PostVisibility = ['PUBLIC', 'FOLLOWERS', 'PRIVATE'] as const;

export const VolunteerStatus = ['OPEN', 'IN_PROGRESS', 'COMPLETED'] as const;

export const ApplicationStatus = ['PENDING', 'ACCEPTED', 'REJECTED'] as const;

export const OrderStatus = ['PENDING', 'PAID', 'DELIVERED', 'CANCELED'] as const;

export const PaymentMethod = ['STRIPE', 'PAYPAL'] as const;

export const NotificationType = ['LIKE', 'COMMENT', 'FOLLOW', 'SHARE', 'MENTION', 'EARNINGS'] as const;

export const ReportTargetType = ['POST', 'COMMENT', 'USER'] as const;

export const ReportStatus = ['PENDING', 'REVIEWED'] as const;

export const ChatType = ['DIRECT', 'GROUP'] as const;

export const MessageStatus = ['SENT', 'DELIVERED', 'READ'] as const;

export const PayOutStatus = ['PENDING', 'PAID'] as const;

export const SubscriptionStatus = ['PENDING', 'ACTIVE', 'INACTIVE', 'CANCELED'] as const;

export const Feelings = [
    'HAPPY', 'SAD', 'ANGRY', 'AMAZED', 'AMUSED', 'SCARED', 'PROUD', 'TIRED', 'CONFUSED',
    'RELAXED', 'EXCITED', 'WORRIED', 'LOVED', 'GRATEFUL', 'BLESSED', 'HUNGRY', 'HOPEFUL',
    'LONELY', 'SILLY', 'THANKFUL', 'AWESOME', 'BORED', 'COOL', 'DETERMINED', 'IN_LOVE',
    'INSPIRED', 'MOTIVATED', 'SICK', 'SLEEPY', 'STRESSED', 'STRONG', 'FUNNY', 'MEH'
] as const;
