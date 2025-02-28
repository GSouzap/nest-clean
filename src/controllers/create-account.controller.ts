import { Body, Controller, HttpCode, Post, UsePipes } from "@nestjs/common";
import { ConflictException } from "@nestjs/common";
import { hash } from "bcryptjs";
import { z } from "zod";

import { ZodValidationPipe } from "@/pipes/zod-validation-pipe";
import { PrismaService } from '../prisma/prisma.service'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string()
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('/accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}
  
  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async handle(@Body() body: CreateAccountBodySchema) {
    const { name, email, password } = body

    const userWithSameEmail = await this.prisma.user.findUnique({
      where: {
        email
      }
    })

    if (userWithSameEmail) {
      throw new ConflictException('User with same e-mail addres already exists')
    }

    const hashedPassowrd = await hash(password, 8)

    await this.prisma.user.create ({
      data: {
        name,
        email,
        password: hashedPassowrd
      }
    })
  }
}