import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { Users } from '../entities/Users';
import { UsersService } from './users.service';

class MockUserRepository {
  #data = [ // 가짜 데이터 만들기. // #변수명 -> 프라이빗 데이터
    { id: 1, email: 'abc@def.net' },
  ];
  fineOne({ where: { email } }) { // 가짜로 데이터 목킹
    const data = this.#data.find((v) => v.email === email);
    if (data) {
      return data;
    }
    return null;
  }
}
class MockWorkspaceMembersRepository {}
class MockChannelMembersRepository {}

describe('UsersService', () => { // describe: 파일단위의 테스트 묶음.(여기서는 users.service)
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({ // 가짜 모듈을 만들어줌.
      providers: [ // 프로바이더의 장점
        UsersService,
        {
          provide: getRepositoryToken(Users), // 1. 실재 db를 건드리지 않기 위해 이 부분을 설정해 가짜로 repository를 만들어주면 됨
          // 함수는 useFactory, 일반 값은 useValue.. 모두 class로 목킹하는 것은 아님.
          useClass: MockUserRepository, // 2. 테스트 대상 로직에서 usersRepository가 MockUserRepository로 대체됨.
        },
        {
          provide: getRepositoryToken(WorkspaceMembers),
          useClass: MockWorkspaceMembersRepository,
        },
        {
          provide: getRepositoryToken(ChannelMembers),
          useClass: MockChannelMembersRepository,
        }

      ], 
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('findByEmail -> 이메일을 통해 유저를 찾음', () => {
    expect(service.findByEmail('abc@def.net'))
      // 테스트 할 로직이 aync/await 때문에 promise를 반환하기 때문에 .resolves를 사용
      // 객체끼리 비교할 때는 .toStrictEqual 사용
      .resolves.toStrictEqual({ email: 'abc@def.net', id: 1 }); 
  });

  it('findByEmail -> user를 못찾으면 null 반환', () => { 
    expect(service.findByEmail('abc12@def.net')).resolves.toBe(null);
  });
});
