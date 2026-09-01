# ==================================================================
# CẦU NỐI QUYỀN QUẢN TRỊ ĐỂ ĐIỀU KHIỂN SMARTSCHEDULER
# ------------------------------------------------------------------
# SS.exe mang cờ requireAdministrator nên luôn chạy quyền quản trị;
# phiên PowerShell thường bị Windows chặn sạch (UI Automation trả 0
# phần tử). Script này chạy Ở QUYỀN QUẢN TRỊ và làm cầu: nó chờ tệp
# lenh.ps1 xuất hiện, chạy, ghi kết quả ra ketqua.txt, rồi xoá lệnh.
#
# Khởi động (người dùng bấm Yes ở UAC MỘT lần cho cả buổi làm việc):
#   Start-Process powershell -Verb RunAs -ArgumentList `
#     '-NoProfile','-ExecutionPolicy','Bypass','-WindowStyle','Hidden',`
#     '-File','<đường dẫn>\ss-cau-noi.ps1','-ThuMuc','<thư mục làm việc>'
#
# Dừng: tạo tệp dung.txt trong thư mục làm việc (hoặc đóng cửa sổ).
#
# ⚠️ Cầu nối chạy BẤT KỲ mã nào ghi vào lenh.ps1, ở quyền quản trị.
#    Chỉ dùng trong buổi làm việc, dừng ngay khi xong.
# ==================================================================
param(
  [Parameter(Mandatory=$true)][string]$ThuMuc
)

if (-not (Test-Path $ThuMuc)) { New-Item -ItemType Directory -Path $ThuMuc -Force | Out-Null }

# Nạp sẵn những thứ mọi lệnh đều cần, để lệnh gửi sang chỉ lo phần việc của nó
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
if (-not ('W' -as [type])) {
  Add-Type @"
using System; using System.Runtime.InteropServices;
public class W {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, uint d, int e);
}
"@
}

# ---- Hàm dùng chung, lệnh gửi sang gọi thẳng được ----

# Đưa SmartScheduler lên trước RỒI mới bấm. Thiếu bước này thì cửa sổ khác
# (hay gặp nhất: cửa sổ terminal) che mất và cú bấm rơi ra ngoài — lệnh không
# chạy mà chẳng báo gì.
function SS-LenTruoc {
  $p = Get-Process -Name SS -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $p) { throw 'SmartScheduler không chạy' }
  [W]::SetForegroundWindow($p.MainWindowHandle) | Out-Null
  Start-Sleep -Milliseconds 700
  return $p
}

function SS-CuaSo {
  $p = Get-Process -Name SS -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $p) { throw 'SmartScheduler không chạy' }
  [System.Windows.Automation.AutomationElement]::FromHandle($p.MainWindowHandle)
}

function SS-Bam($x, $y) {
  [W]::SetCursorPos($x, $y); Start-Sleep -Milliseconds 350
  [W]::mouse_event(0x02,0,0,0,0); Start-Sleep -Milliseconds 60
  [W]::mouse_event(0x04,0,0,0,0)
}

# Bấm đúp — dùng để chọn tệp trong hộp Open. An toàn hơn hẳn việc dò ô nhập
# rồi dán đường dẫn: đã có lần dò trúng ô ĐỔI TÊN TỆP.
function SS-BamDup($x, $y) {
  [W]::SetCursorPos($x, $y); Start-Sleep -Milliseconds 400
  [W]::mouse_event(0x02,0,0,0,0); Start-Sleep -Milliseconds 40; [W]::mouse_event(0x04,0,0,0,0)
  Start-Sleep -Milliseconds 80
  [W]::mouse_event(0x02,0,0,0,0); Start-Sleep -Milliseconds 40; [W]::mouse_event(0x04,0,0,0,0)
}

# Mở một mục menu theo đường dẫn, ví dụ: SS-Menu 'Dữ liệu' 'Dữ liệu lớp học' 'Danh sách lớp học'
function SS-Menu {
  param([string[]]$Duong)
  $AE = [System.Windows.Automation.AutomationElement]
  $TS = [System.Windows.Automation.TreeScope]::Descendants
  $nut = SS-CuaSo
  for ($i = 0; $i -lt $Duong.Count; $i++) {
    $dk = New-Object System.Windows.Automation.PropertyCondition($AE::NameProperty, $Duong[$i])
    $m  = $nut.FindFirst($TS, $dk)
    if (-not $m) { throw "Không thấy mục menu '$($Duong[$i])'" }
    if ($i -lt $Duong.Count - 1) {
      $m.GetCurrentPattern([System.Windows.Automation.ExpandCollapsePattern]::Pattern).Expand()
      Start-Sleep -Milliseconds 700
      $nut = $m
    } else {
      $m.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()
      Start-Sleep -Seconds 2
    }
  }
}

# Hộp Open / Save As là cửa sổ Win32 (#32770) nằm BÊN TRONG cây cửa sổ chính,
# không ở top-level — tìm sai chỗ là tưởng hộp chưa mở.
function SS-HopThoai {
  $AE = [System.Windows.Automation.AutomationElement]
  $dk = New-Object System.Windows.Automation.PropertyCondition($AE::ClassNameProperty, '#32770')
  (SS-CuaSo).FindFirst([System.Windows.Automation.TreeScope]::Descendants, $dk)
}

function SS-BamNut($Ten, $Goc) {
  $AE = [System.Windows.Automation.AutomationElement]
  if (-not $Goc) { $Goc = SS-CuaSo }
  $dk = New-Object System.Windows.Automation.PropertyCondition(
          $AE::ControlTypeProperty, [System.Windows.Automation.ControlType]::Button)
  foreach ($b in $Goc.FindAll([System.Windows.Automation.TreeScope]::Descendants, $dk)) {
    if ($b.Current.Name -eq $Ten) {
      $r = $b.Current.BoundingRectangle
      SS-Bam ([int]($r.X + $r.Width / 2)) ([int]($r.Y + $r.Height / 2))
      return $true
    }
  }
  return $false
}

# Chụp màn hình — kiểm sau MỖI bước, đừng tin là lệnh đã chạy
function SS-Chup($Ten) {
  $b = [System.Windows.Forms.SystemInformation]::VirtualScreen
  $bmp = New-Object System.Drawing.Bitmap($b.Width, $b.Height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($b.Left, $b.Top, 0, 0, $bmp.Size)
  $bmp.Save((Join-Path $ThuMuc $Ten), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

# ---- Vòng cầu nối ----
"SAN SANG $(Get-Date -Format 'HH:mm:ss')" | Set-Content (Join-Path $ThuMuc 'cau-noi-song.txt') -Encoding UTF8

while ($true) {
  if (Test-Path (Join-Path $ThuMuc 'dung.txt')) { break }
  $tepLenh = Join-Path $ThuMuc 'lenh.ps1'
  if (Test-Path $tepLenh) {
    Start-Sleep -Milliseconds 150            # chờ tệp ghi xong hẳn
    $ma = Get-Content $tepLenh -Raw -Encoding UTF8
    Remove-Item $tepLenh -Force -ErrorAction SilentlyContinue
    $ra = New-Object Collections.Generic.List[string]
    try {
      foreach ($d in (& ([scriptblock]::Create($ma)) 2>&1)) { $ra.Add([string]$d) }
    } catch {
      $ra.Add('LOI: ' + $_.Exception.Message)
    }
    $ra.Add('===XONG===')
    $ra -join "`n" | Set-Content (Join-Path $ThuMuc 'ketqua.txt') -Encoding UTF8
  }
  Start-Sleep -Milliseconds 200
}
Remove-Item (Join-Path $ThuMuc 'cau-noi-song.txt') -Force -ErrorAction SilentlyContinue
