import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateFollowerInput {
  @Field()
  userIdToFollow: string; // the UUID of the user to follow
}
