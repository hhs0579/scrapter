import 'package:provider/provider.dart';
import 'package:provider/single_child_widget.dart';
import 'counter_provider.dart';
import 'theme_provider.dart';

class AppProviders {
  static List<SingleChildWidget> providers = [
    ChangeNotifierProvider(create: (_) => CounterProvider()),
    ChangeNotifierProvider(create: (_) => ThemeProvider()),
  ];
}

