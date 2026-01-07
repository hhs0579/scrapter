import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CommonFooter extends StatelessWidget {
  const CommonFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: MediaQuery.of(context).size.width * 0.1,
        vertical: 80,
      ),
      color: Colors.grey[400],
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Image.asset(
                    'assets/images/logo.png',
                    height: 40,
                    fit: BoxFit.contain,
                    color: Colors.white,
                    errorBuilder: (context, error, stackTrace) {
                      return const Text(
                        'Scrapter',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Scrapter | 원하는 문서를, 원하는 형식으로',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white,
                        ),
                  ),
                  const SizedBox(
                    height: 12,
                  ),
                  Text(
                    '복잡한 기획 과정을 간편하게 시작하세요.\n문의하기 | info@9works.kr',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white,
                        ),
                  )
                ],
              ),
              Row(
                children: [
                  _buildFooterLink(
                      context, '서비스 소개', () => context.go('/service-intro')),
                  _buildFooterLink(
                      context, '가격 안내', () => context.go('/pricing')),
                  _buildFooterLink(
                      context, '자주 묻는 질문', () => context.go('/faq')),
                  _buildFooterLink(context, '고객 지원'),
                ],
              ),
            ],
          ),
          const SizedBox(height: 40),
          const Divider(color: Colors.white),
          const SizedBox(height: 20),
          Text(
            '© 2025 Scrapter. All rights reserved.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooterLink(BuildContext context, String text,
      [VoidCallback? onTap]) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: InkWell(
        onTap: onTap,
        child: Text(
          text,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.white,
              ),
        ),
      ),
    );
  }
}



