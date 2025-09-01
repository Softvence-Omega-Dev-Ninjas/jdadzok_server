import { SetMetadata } from "@nestjs/common"

export const SOCKET_EVENT = Symbol("SOCKET_EVENT")

export const OnSocketEvent = <E extends string>(event: E): MethodDecorator => SetMetadata(SOCKET_EVENT, event) 