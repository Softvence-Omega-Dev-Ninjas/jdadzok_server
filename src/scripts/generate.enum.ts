import { ApplicationStatus, AuthProvider, CapLevel, ChatType, Feelings, MediaType, MessageStatus, NotificationType, OrderStatus, PaymentMethod, PayOutStatus, PostVisibility, ReportStatus, ReportTargetType, Role, SubscriptionStatus, VolunteerStatus } from '@project/constants';
import fs from 'fs';
import path from 'path';

const enums: Record<string, readonly string[]> = {
    Role,
    AuthProvider,
    CapLevel,
    MediaType,
    PostVisibility,
    VolunteerStatus,
    ApplicationStatus,
    OrderStatus,
    PaymentMethod,
    NotificationType,
    ReportTargetType,
    ReportStatus,
    ChatType,
    MessageStatus,
    PayOutStatus,
    SubscriptionStatus,
    Feelings
};

function generateEnumBlock<V>(name: string, values: readonly V[]) {
    return `enum ${name} {\n  ${values.join('\n  ')}\n}`;
}

function generateAllEnumBlocks() {
    return Object.entries(enums).map(([name, values]) => generateEnumBlock(name, values)).join('\n\n');
}

function injectEnumsIntoSchema(schemaPath: string) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    const startTag = '// ENUMS_START';
    const endTag = '// ENUMS_END';

    const beforeEnums = schema.split(startTag)[0];
    const afterEnums = schema.includes(endTag)
        ? schema.split(endTag)[1]
        : '';

    const enumBlocks = generateAllEnumBlocks();

    const newSchema = `${beforeEnums}${startTag}\n\n${enumBlocks}\n\n${endTag}${afterEnums}`;

    fs.writeFileSync(schemaPath, newSchema.trim() + '\n', 'utf-8');
    console.log('✅ Prisma enums injected successfully into schema.prisma');
}

// Run it
const schemaPath = path.join(process.cwd(), 'prisma', "models", 'enum.prisma');
if (!fs.existsSync(schemaPath)) {
    console.error('❌ enum.prisma not found at prisma/models/enum.prisma');
    process.exit(1);
}

injectEnumsIntoSchema(schemaPath);
