import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:responsive_framework/responsive_framework.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/auth_service.dart';
import '../services/color.dart';

class CommonHeader extends StatefulWidget {
  const CommonHeader({super.key});

  @override
  State<CommonHeader> createState() => _CommonHeaderState();
}

class _CommonHeaderState extends State<CommonHeader> {
  bool _isMenuOpen = false;

  @override
  Widget build(BuildContext context) {
    // Firebase가 초기화되지 않았을 수 있으므로 try-catch로 처리
    Stream<User?>? authStream;
    try {
      authStream = FirebaseAuth.instance.authStateChanges();
    } catch (e) {
      // Firebase가 초기화되지 않은 경우 빈 stream 사용
      authStream = Stream.value(null);
    }

    return StreamBuilder<User?>(
      stream: authStream,
      initialData: null, // 초기값을 null로 설정
      builder: (context, snapshot) {
        // Firebase가 초기화되지 않았거나 에러가 발생한 경우 로그인하지 않은 것으로 처리
        final user = snapshot.hasError ? null : snapshot.data;
        final isLoggedIn = user != null;

        final isDesktop = ResponsiveBreakpoints.of(context).largerThan(TABLET);
        
        return Column(
          children: [
            Container(
              padding: EdgeInsets.symmetric(
                vertical: 20,
                horizontal: MediaQuery.of(context).size.width * 0.14,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
              ),
              child: Row(
                children: [
                  // 로고 (logo.png 사용)
                  InkWell(
                    onTap: () => context.go('/'),
                    child: Image.asset(
                      'assets/images/logo.png',
                      height: 40,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) {
                        return const SizedBox(
                          height: 40,
                          child: Center(
                            child: Text(
                              'Scrapter',
                              style: TextStyle(
                                color: Colors.black,
                                fontWeight: FontWeight.bold,
                                fontSize: 20,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const Spacer(),

                  // 오른쪽 버튼 및 아이콘
                  Row(
                    children: [
                      // 도입 문의하기 버튼 (오렌지색)
                      InkWell(
                        onTap: () => context.go('/contact'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: AppColor.primary,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Center(
                            child: Text(
                              '도입 문의하기',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w500,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 24),
                      // 지구본 아이콘
                      InkWell(
                        onTap: () {
                          // 언어 변경 또는 기타 기능
                        },
                        child: const Icon(
                          Icons.language,
                          color: Colors.black,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      // 사용자 아이콘
                      InkWell(
                        onTap: () {
                          if (isLoggedIn) {
                            context.go('/mypage');
                          } else {
                            context.go('/login');
                          }
                        },
                        child: const Icon(
                          Icons.person,
                          color: Colors.black,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      // 로그아웃 아이콘 (맨 오른쪽)
                      InkWell(
                        onTap: () async {
                          if (isLoggedIn) {
                            try {
                              await AuthService().signOut();
                              if (context.mounted) {
                                context.go('/');
                              }
                            } catch (e) {
                              // Firebase가 초기화되지 않은 경우 무시
                              if (context.mounted) {
                                context.go('/');
                              }
                            }
                          } else {
                            context.go('/login');
                          }
                        },
                        child: Icon(
                          isLoggedIn ? Icons.logout : Icons.login,
                          color: Colors.black,
                          size: 24,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // 네비게이션 메뉴 (아래로 이동)
            if (isDesktop)
              Container(
                padding: EdgeInsets.symmetric(
                  vertical: 12,
                  horizontal: MediaQuery.of(context).size.width * 0.14,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border(
                    bottom: BorderSide(
                      color: Colors.grey.withOpacity(0.5),
                      width: 1,
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    _buildNavItem(context, '홈', () => context.go('/')),
                    _buildNavItem(
                        context, '사용가이드', () => context.go('/user-guide')),
                  ],
                ),
              )
            else
              // 모바일: 햄버거 메뉴
              Container(
                padding: EdgeInsets.symmetric(
                  vertical: 12,
                  horizontal: MediaQuery.of(context).size.width * 0.14,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border(
                    bottom: BorderSide(
                      color: Colors.grey.withOpacity(0.5),
                      width: 1,
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    InkWell(
                      onTap: () {
                        setState(() {
                          _isMenuOpen = !_isMenuOpen;
                        });
                      },
                      child: const Icon(
                        Icons.menu,
                        color: Colors.black,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    if (_isMenuOpen)
                      Expanded(
                        child: Row(
                          children: [
                            _buildNavItem(context, '홈', () {
                              context.go('/');
                              setState(() => _isMenuOpen = false);
                            }),
                            _buildNavItem(context, '사용가이드', () {
                              context.go('/user-guide');
                              setState(() => _isMenuOpen = false);
                            }),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _buildNavItem(BuildContext context, String title, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: InkWell(
        onTap: onTap,
        child: Text(
          title,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.black,
                fontWeight: FontWeight.w500,
                fontSize: 16,
              ),
        ),
      ),
    );
  }
}

