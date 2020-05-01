package config

import (
	"flag"
	"reflect"
	"strings"
	"testing"

	"github.com/pascaldekloe/goe/verify"
	"github.com/stretchr/testify/require"
)

// TestParseFlags tests whether command line flags are properly parsed
// into the Flags/File structure. It contains an example for every type
// that is parsed. It does not test the conversion into the final
// runtime configuration. See TestConfig for that.
func TestParseFlags(t *testing.T) {
	tests := []struct {
		args  []string
		flags BuilderOpts
		extra []string
		err   error
	}{
		{},
		{
			args:  []string{`-bind`, `a`},
			flags: BuilderOpts{Config: Config{BindAddr: pString("a")}},
		},
		{
			args:  []string{`-bootstrap`},
			flags: BuilderOpts{Config: Config{Bootstrap: pBool(true)}},
		},
		{
			args:  []string{`-bootstrap=true`},
			flags: BuilderOpts{Config: Config{Bootstrap: pBool(true)}},
		},
		{
			args:  []string{`-bootstrap=false`},
			flags: BuilderOpts{Config: Config{Bootstrap: pBool(false)}},
		},
		{
			args:  []string{`-config-file`, `a`, `-config-dir`, `b`, `-config-file`, `c`, `-config-dir`, `d`},
			flags: BuilderOpts{ConfigFiles: []string{"a", "b", "c", "d"}},
		},
		{
			args:  []string{`-datacenter`, `a`},
			flags: BuilderOpts{Config: Config{Datacenter: pString("a")}},
		},
		{
			args:  []string{`-dns-port`, `1`},
			flags: BuilderOpts{Config: Config{Ports: Ports{DNS: pInt(1)}}},
		},
		{
			args:  []string{`-grpc-port`, `1`},
			flags: BuilderOpts{Config: Config{Ports: Ports{GRPC: pInt(1)}}},
		},
		{
			args:  []string{`-http-port`, `1`},
			flags: BuilderOpts{Config: Config{Ports: Ports{HTTP: pInt(1)}}},
		},
		{
			args:  []string{`-https-port`, `1`},
			flags: BuilderOpts{Config: Config{Ports: Ports{HTTPS: pInt(1)}}},
		},
		{
			args:  []string{`-serf-lan-port`, `1`},
			flags: BuilderOpts{Config: Config{Ports: Ports{SerfLAN: pInt(1)}}},
		},
		{
			args:  []string{`-serf-wan-port`, `1`},
			flags: BuilderOpts{Config: Config{Ports: Ports{SerfWAN: pInt(1)}}},
		},
		{
			args:  []string{`-server-port`, `1`},
			flags: BuilderOpts{Config: Config{Ports: Ports{Server: pInt(1)}}},
		},
		{
			args:  []string{`-join`, `a`, `-join`, `b`},
			flags: BuilderOpts{Config: Config{StartJoinAddrsLAN: []string{"a", "b"}}},
		},
		{
			args:  []string{`-node-meta`, `a:b`, `-node-meta`, `c:d`},
			flags: BuilderOpts{Config: Config{NodeMeta: map[string]string{"a": "b", "c": "d"}}},
		},
		{
			args:  []string{`-bootstrap`, `true`},
			flags: BuilderOpts{Config: Config{Bootstrap: pBool(true)}},
			extra: []string{"true"},
		},
		{
			args: []string{`-primary-gateway`, `foo.local`, `-primary-gateway`, `bar.local`},
			flags: BuilderOpts{Config: Config{PrimaryGateways: []string{
				"foo.local", "bar.local",
			}}},
		},
	}

	for _, tt := range tests {
		t.Run(strings.Join(tt.args, " "), func(t *testing.T) {
			flags := BuilderOpts{}
			fs := flag.NewFlagSet("", flag.ContinueOnError)
			AddFlags(fs, &flags)
			err := fs.Parse(tt.args)
			if got, want := err, tt.err; !reflect.DeepEqual(got, want) {
				t.Fatalf("got error %v want %v", got, want)
			}
			require.ElementsMatch(t, fs.Args(), tt.extra)
			if !verify.Values(t, "flag", flags, tt.flags) {
				t.FailNow()
			}
		})
	}
}
