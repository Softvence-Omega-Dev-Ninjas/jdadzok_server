@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/js/notification',
})
@Injectable()
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);
  private readonly clients = new Map<string, Set<Socket>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('Socket.IO server initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromSocket(client);
      if (!token) return client.disconnect(true);

      const payload = this.jwtService.verify<JWTPayload>(token, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });

      if (!payload.sub) return client.disconnect(true);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          notificationToggle: true, // relation in DB
        },
      });

      if (!user) return client.disconnect(true);

      const payloadForSocketClient = {
        sub: user.id,
        email: user.email,
        notificationToggle: user.notificationToggle,
      };

      client.data.user = payloadForSocketClient;
      this.subscribeClient(user.id, client);

      this.logger.log(`Client connected: ${user.id}`);
    } catch (err: any) {
      this.logger.warn(`JWT verification failed: ${err.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.user?.sub;
    if (userId) this.unsubscribeClient(userId, client);
  }

  private extractTokenFromSocket(client: Socket): string | null {
    const authHeader =
      client.handshake.headers.authorization || client.handshake.auth?.token;
    if (!authHeader) return null;
    return authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;
  }

  private subscribeClient(userId: string, client: Socket) {
    if (!this.clients.has(userId)) this.clients.set(userId, new Set());
    this.clients.get(userId)!.add(client);
    this.logger.debug(`Subscribed client to user ${userId}`);
  }

  private unsubscribeClient(userId: string, client: Socket) {
    const set = this.clients.get(userId);
    if (!set) return;
    set.delete(client);
    if (set.size === 0) this.clients.delete(userId);
  }

  public getClientsForUser(userId: string): Set<Socket> {
    return this.clients.get(userId) || new Set();
  }

  // Notify single user (respecting notification toggle)
  public async notifySingleUser(
    userId: string,
    event: string,
    data: Notification,
  ) {
    const clients = this.getClientsForUser(userId);
    if (!clients.size)
      return this.logger.warn(`No clients connected for user ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationToggle: true },
    });

    if (!user?.notificationToggle?.[event]) return; // respect toggle

    clients.forEach((client) => client.emit(event, data));
    this.logger.log(`Notification sent to user ${userId} via event ${event}`);
  }

  public async notifyMultipleUsers(
    userIds: string[],
    event: string,
    data: Notification,
  ) {
    for (const userId of userIds) {
      await this.notifySingleUser(userId, event, data);
    }
  }

  public async notifyAllUsers(event: string, data: Notification) {
    this.clients.forEach((clients) => {
      clients.forEach((client) => client.emit(event, data));
    });
  }

  // Optional chat event emitter
  public async sendChatMessage(conversationId: string, message: any) {
    const participants = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { participants: { select: { id: true } } },
    });

    participants?.participants.forEach((user) => {
      this.getClientsForUser(user.id).forEach((client) => {
        client.emit('chatMessage', message);
      });
    });
  }
}
