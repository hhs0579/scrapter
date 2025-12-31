import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:responsive_framework/responsive_framework.dart';
import 'providers/app_providers.dart';
import 'providers/theme_provider.dart';
import 'providers/counter_provider.dart';
import 'components/common_header.dart';
import 'components/common_footer.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Firebase 초기화 (Firebase 설정이 완료된 경우 주석 해제)
  // await Firebase.initializeApp();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    // GoRouter 설정
    final router = GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) =>
              const MyHomePage(title: 'Flutter Demo Home Page'),
        ),
        // 필요에 따라 다른 라우트들을 추가할 수 있습니다
        // GoRoute(
        //   path: '/login',
        //   builder: (context, state) => const LoginPage(),
        // ),
        // GoRoute(
        //   path: '/mypage',
        //   builder: (context, state) => const MyPage(),
        // ),
        // GoRoute(
        //   path: '/user-guide',
        //   builder: (context, state) => const UserGuidePage(),
        // ),
        // GoRoute(
        //   path: '/contact',
        //   builder: (context, state) => const ContactPage(),
        // ),
      ],
    );

    return MultiProvider(
      providers: AppProviders.providers,
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp.router(
            title: 'Flutter Demo',
            theme: ThemeData(
              fontFamily: 'Pretendard',
              colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
              useMaterial3: true,
            ),
            darkTheme: ThemeData(
              fontFamily: 'Pretendard',
              colorScheme: ColorScheme.fromSeed(
                seedColor: Colors.deepPurple,
                brightness: Brightness.dark,
              ),
              useMaterial3: true,
            ),
            themeMode: themeProvider.themeMode,
            routerConfig: router,
            builder: (context, child) => ResponsiveBreakpoints.builder(
              child: child!,
              breakpoints: [
                const Breakpoint(start: 0, end: 450, name: MOBILE),
                const Breakpoint(start: 451, end: 800, name: TABLET),
                const Breakpoint(start: 801, end: 1920, name: DESKTOP),
                const Breakpoint(start: 1921, end: double.infinity, name: '4K'),
              ],
            ),
          );
        },
      ),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  void _incrementCounter() {
    context.read<CounterProvider>().increment();
  }

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually add instances of widgets.
    return Scaffold(
      body: Column(
        children: [
          // 공통 헤더 추가
          const CommonHeader(),
          // 기존 body 내용
          Expanded(
            child: Center(
              // Center is a layout widget. It takes a single child and positions it
              // in the middle of the parent.
              child: Column(
                // Column is also a layout widget. It takes a list of children and
                // arranges them vertically. By default, it sizes itself to fit its
                // children horizontally, and tries to be as tall as its parent.
                //
                // Column has various properties to control how it sizes itself and
                // how it positions its children. Here we use mainAxisAlignment to
                // center the children vertically; the main axis here is the vertical
                // axis because Columns are vertical (the cross axis would be
                // horizontal).
                //
                // TRY THIS: Invoke "debug painting" (choose the "Toggle Debug Paint"
                // action in the IDE, or press "p" in the console), to see the
                // wireframe for each widget.
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  const Text(
                    'You have pushed the button this many times:',
                  ),
                  Consumer<CounterProvider>(
                    builder: (context, counterProvider, child) {
                      return Text(
                        '${counterProvider.counter}',
                        style: Theme.of(context).textTheme.headlineMedium,
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          // 공통 푸터 추가
          const CommonFooter(),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ), // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
}
