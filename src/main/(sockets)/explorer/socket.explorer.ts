import { Logger, OnModuleInit } from "@nestjs/common";
import { ModuleRef, Reflector } from "@nestjs/core";
import { SharedSocketService } from "../shared/shared.socket.service";

export class SocketExplorer implements OnModuleInit {

    private readonly logger = new Logger(SocketExplorer.name);

    constructor(
        private readonly sharedSocket: SharedSocketService,
        private readonly moduleRef: ModuleRef,
        private readonly reflector: Reflector,
    ) { }

    onModuleInit() {
        const provider = this.moduleRef;
        console.log('providers: ', provider)
        // for (const [, instance] of Object.entries(provider)) {
        //     const prototype = Object.getPrototypeOf(instance);
        //     if (!prototype) continue;

        //     const methods = Object.getOwnPropertyNames(prototype);

        //     if (!methods) return console.info("no methods");
        //     if (!instance) return console.info("instance not found!");

        //     for (const method of methods) {
        //         const handler = (instance as Record<string, any>)[method];

        //         if (typeof handler !== "function") continue;

        //         const event = this.reflector.get<string>(SOCKET_EVENT, handler);
        //         if (event) {
        //             this.logger.log(`Binding @OnSocketEvent(${event}) → ${instance.constructor.name}.${method}`);
        //             this.sharedSocket.on(event as any, (payload, socket) => handler.call(instance, payload, socket))
        //         }
        //     }
        // }
    }
}