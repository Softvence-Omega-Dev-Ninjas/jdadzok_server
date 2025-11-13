export class CreatePaymentIntentDto {
    orderId: string;
    amount: number;
    currency?: string;
}
