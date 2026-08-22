const fs = require('fs');
const path = 'app/src/main/java/com/dyzzy/aetheris/ui/components/GrimoirePanel.kt';
let code = fs.readFileSync(path, 'utf8');

const imports = `
import android.webkit.DownloadListener
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.util.Base64
import java.io.File
import java.io.FileOutputStream
import android.widget.Toast
`;

if (!code.includes('import android.webkit.DownloadListener')) {
    code = code.replace('import android.webkit.WebView', 'import android.webkit.WebView' + imports);
}

const listenerCode = `
                setDownloadListener { url, userAgent, contentDisposition, mimetype, contentLength ->
                    try {
                        if (url.startsWith("data:")) {
                            val base64 = url.substring(url.indexOf(",") + 1)
                            val fileData = Base64.decode(base64, Base64.DEFAULT)
                            val path = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                            val file = File(path, "Aetheris_Dossier_" + System.currentTimeMillis() + ".pdf")
                            val os = FileOutputStream(file)
                            os.write(fileData)
                            os.close()
                            Toast.makeText(context, "Dossier exported to Downloads", Toast.LENGTH_LONG).show()
                        } else {
                            val i = Intent(Intent.ACTION_VIEW)
                            i.data = Uri.parse(url)
                            context.startActivity(i)
                        }
                    } catch (e: Exception) {
                        Toast.makeText(context, "Export failed: " + e.message, Toast.LENGTH_SHORT).show()
                    }
                }
                
                // Register Native-to-JS Interface
`;

code = code.replace('// Register Native-to-JS Interface', listenerCode);

fs.writeFileSync(path, code, 'utf8');
console.log("Patched GrimoirePanel.kt");
