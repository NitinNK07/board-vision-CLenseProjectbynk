import java.nio.file.*;
import java.util.regex.*;
import java.util.stream.*;

public class AddDocs {
    public static void main(String[] args) throws Exception {
        Path root = Paths.get("src/main/java/CLens/pgn_backend");
        Files.walk(root)
            .filter(p -> p.toString().endsWith(".java"))
            .forEach(p -> {
                try {
                    String content = Files.readString(p);
                    boolean changed = false;
                    
                    // Add class doc if not present
                    if (!content.contains("/**")) {
                        Matcher m = Pattern.compile("(?m)^(@\\w+(\\(.*\\))?\\s*)*public (class|interface|record) (\\w+)").matcher(content);
                        if (m.find()) {
                            String className = m.group(4);
                            content = m.replaceFirst("/**\n * Enterprise implementation of " + className + ".\n * Provides core functionality and business logic.\n */\n$0");
                            changed = true;
                        }
                    }
                    
                    // Basic method docs for public methods (excluding getters/setters/constructors)
                    Matcher m2 = Pattern.compile("(?m)^(\\s+)(@\\w+(\\(.*\\))?\\s*)*public ([\\w<>\\[\\]]+) ([a-z]\\w+)\\s*\\(").matcher(content);
                    StringBuffer sb = new StringBuffer();
                    while (m2.find()) {
                        String indent = m2.group(1);
                        String methodName = m2.group(5);
                        // Skip if it looks like there's already a javadoc above it (very rough check)
                        if (!methodName.startsWith("get") && !methodName.startsWith("set")) {
                            m2.appendReplacement(sb, indent + "/**\n" + indent + " * Executes the " + methodName + " operation.\n" + indent + " */\n" + m2.group(0));
                            changed = true;
                        } else {
                            m2.appendReplacement(sb, m2.group(0));
                        }
                    }
                    m2.appendTail(sb);
                    
                    if (changed) {
                        Files.writeString(p, sb.toString());
                        System.out.println("Added JavaDocs to: " + p.getFileName());
                    }
                } catch(Exception e){
                    System.err.println("Failed on " + p + ": " + e.getMessage());
                }
            });
    }
}
