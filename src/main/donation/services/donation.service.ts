import { PrismaService } from "@lib/prisma/prisma.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import Stripe from "stripe";
import { CreateDonationDto } from "../dto/create-donation.dto";

@Injectable()
export class DonationService {
    private stripe: Stripe;

    constructor(private readonly prisma: PrismaService) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET!, {});
    }

    async createCheckoutSession(userId: string, communityId: string, payload: CreateDonationDto) {
        try {
            const { amount } = payload;

            // Fetch community
            const community = await this.prisma.community.findUnique({
                where: { id: communityId },
                include: { owner: true },
            });
            if (!community) throw new NotFoundException("Community not found");

            const ownerPaymentMethod = await this.prisma.paymentMethods.findFirst({
                where: { userId: community.ownerId, isDefault: true },
            });
            if (!ownerPaymentMethod)
                throw new BadRequestException("Community owner has not added a payment method yet");

            // Create Stripe Checkout session
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            product_data: { name: `Donation to ${community.owner.email || community.id}` },
                            unit_amount: Math.round(amount * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: `${process.env.FRONTEND_URL}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/donation/cancel`,
                metadata: { donorId: userId, communityId },
            });

            // Save donation record (PENDING)
            await this.prisma.donations.create({
                data: {
                    sessionId: session.id,
                    amount,
                    status: "PENDING",
                    userId,
                },
            });

            return { url: session.url };
        } catch (error) {
            console.error("Error creating checkout session:", error);
            throw error;
        }
    }
    async findMyPayments(userId: string) {
        return this.prisma.donations.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async findAllPayments() {
        return this.prisma.donations.findMany({
            orderBy: { createdAt: "desc" },
            include: { user: true },
        });
    }
}
