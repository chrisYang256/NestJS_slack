/* 
단위 테스트: service를 목킹하여 테스트를 진행
  - service 테스트를 이미 했다면 service를 다시 테스트할 필요 없음
  - service가 올바른 결과값을 돌려준다는 가정 하에 controller 테스트 코드를 만들면 됨

통합 테스트: db만 목킹하고 controller와 service를 함께 테스팅
  - 가짜로 만들지 않는다면 적어도 db는 가짜로 만들어줘야 함.(실재 db 사용 않기 위함)
  - controller를 테스팅 하는 경우 서비스 까지 함께 테스트 하는 것과 마찬가지
  - 한 번에 두가지의 함수나 클래스를 테스팅 하는 것을 통합테스트하고 함
  - 반드시 통합 테스트가 필요한 것은 아니고 e2e 테스트만으로 충분
*/

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

class MockUsersService {}

// controller test는 service에서 값이 잘 리턴되는지 확인 정도만으로 충분.
describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useClass: MockUsersService, 
        }
    ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
