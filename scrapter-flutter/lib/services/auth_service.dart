import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // 현재 사용자 가져오기
  User? get currentUser => _auth.currentUser;

  // 로그아웃
  Future<void> signOut() async {
    await _auth.signOut();
  }

  // 필요에 따라 다른 인증 메서드들을 추가할 수 있습니다
  // Future<UserCredential?> signInWithEmailAndPassword(String email, String password) async { ... }
  // Future<UserCredential?> signInWithGoogle() async { ... }
}



